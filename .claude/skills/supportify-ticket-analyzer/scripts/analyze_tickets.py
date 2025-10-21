#!/usr/bin/env python3
"""
Ticket Analysis Script for Supportify
Parses help desk Excel files, categorizes issues, and generates insights
"""

import pandas as pd
import sys
import json
from pathlib import Path
from collections import Counter
import re

# Keywords for Apple-addressable issues (inclusive approach for Phase 1)
APPLE_ADDRESSABLE_KEYWORDS = {
    # Original consumer-focused categories (1-10)
    'macos_update': ['macos update', 'os update', 'system update', 'os upgrade', 'macos upgrade', 'sequoia', 'sonoma', 'ventura', 'monterey', 'big sur'],
    'login_issue': ['login issue', 'login problem', 'password reset', 'forgot password', 'filevault', 'keychain', 'icloud login', 'user password'],
    'hardware_issue': ['hardware', 'battery', 'display', 'keyboard', 'trackpad', 'ssd', 'storage', 'memory', 'thermal', 'overheating', 'fan noise'],
    'wifi_network': ['wifi', 'wireless', 'network connection', 'internet connection', 'wi-fi', 'airport', 'network settings'],
    'vpn_issue': ['vpn connection', 'vpn setup', 'l2tp', 'ikev2', 'ipsec'],
    'performance': ['slow', 'performance', 'freeze', 'hang', 'crash', 'system data', 'storage full', 'lag', 'unresponsive'],
    'native_apps': ['mail app', 'safari', 'messages', 'facetime', 'calendar app', 'notes app', 'reminders', 'photos app', 'music app'],
    'bluetooth': ['bluetooth', 'airdrop', 'handoff', 'continuity', 'universal control', 'sidecar'],
    'printer': ['print', 'printer', 'airprint', 'print queue'],
    'permissions': ['permissions', 'security & privacy', 'system preferences', 'system settings', 'gatekeeper', 'xprotect'],

    # New enterprise-friendly categories (11-17)
    'mdm_management': ['mdm enrollment', 'device enrollment', 'dep enrollment', 'ade enrollment', 'apple business manager', 'apple school manager',
                       'abm', 'asm', 'configuration profile', 'device management', 'mobile device management'],
    'app_deployment': ['app deployment', 'application installation', 'app install', 'package installation', '.pkg', '.dmg',
                       'app store deployment', 'managed app', 'app won\'t install', 'software install'],
    'enterprise_auth': ['active directory', 'domain join', 'kerberos', 'ldap', 'directory services', 'network account',
                        'certificate authentication', 'enterprise authentication'],
    'enterprise_network': ['proxy configuration', '802.1x', 'network authentication', 'certificate installation',
                           'enterprise certificate', 'network access control', 'nac', 'corporate network'],
    'file_sharing': ['file share', 'network share', 'smb', 'afp', 'connect to server', 'network drive',
                     'mounted volume', 'file permissions', 'folder access'],
    'software_update_mgmt': ['software update policy', 'managed update', 'update catalog', 'deferred update', 'delayed update'],
    'device_lifecycle': ['migration assistant', 'setup assistant', 'erase mac', 'factory reset', 'activation lock',
                        'device transfer', 'mac setup', 'data migration']
}

# Keywords for vendor-specific issues with LIMITED Apple documentation
# These are more specific to identify true vendor-specific problems
VENDOR_SPECIFIC_KEYWORDS = {
    'jamf_specific': ['jamf pro', 'jamf policy', 'jamf smart group', 'jamf script', 'jamf self service'],
    'intune_specific': ['intune', 'microsoft endpoint', 'company portal'],
    'other_mdm_vendors': ['kandji', 'mosyle', 'addigy', 'workspace one'],
    'third_party_app_issues': ['slack crash', 'chrome crash', 'zoom crash', 'lucidlink error', 'chester error',
                               'app crash', 'application error', 'software license'],
    'vendor_vpn_clients': ['cisco anyconnect', 'globalprotect', 'zscaler', 'cloudflare warp', 'vpn client'],
    'asset_management': ['asset tracking', 'inventory system', 'servicenow', 'jira service'],
    'org_specific': ['compliance reporting', 'hipaa', 'sox', 'custom policy']
}

def detect_file_structure(file_path, sheet_name=None):
    """
    Detect the structure of the Excel file and determine header row
    Returns: (dataframe, metadata)
    """
    # First, try to find a sheet with raw data if no sheet specified
    if sheet_name is None:
        try:
            xl_file = pd.ExcelFile(file_path)
            # Look for common raw data sheet names
            for potential_sheet in ['Raw data', 'raw data', 'Data', 'Tickets', 'Sheet1']:
                if potential_sheet in xl_file.sheet_names:
                    sheet_name = potential_sheet
                    break
        except Exception:
            pass

    # Try reading with different header rows
    for header_row in [0, 1, 2]:
        try:
            df = pd.read_excel(file_path, header=header_row, sheet_name=sheet_name)

            # Check if we have meaningful column names
            if 'Number' in df.columns or 'Description' in df.columns or 'Short description' in df.columns:
                return df, {'header_row': header_row, 'format': 'standard', 'sheet_name': sheet_name}
        except Exception:
            continue

    # If no standard format found, read as-is
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    return df, {'header_row': 0, 'format': 'unknown', 'sheet_name': sheet_name}

def normalize_columns(df):
    """
    Normalize column names across different vendor formats
    """
    # Create a mapping of possible column names to standard names
    column_mapping = {}
    
    for col in df.columns:
        col_lower = str(col).lower()
        
        if 'number' in col_lower and 'count' not in col_lower:
            column_mapping[col] = 'ticket_id'
        elif 'short description' in col_lower or 'short_description' in col_lower:
            column_mapping[col] = 'short_description'
        elif col_lower == 'description':
            column_mapping[col] = 'description'
        elif 'assignment group' in col_lower:
            column_mapping[col] = 'assignment_group'
        elif 'classification' in col_lower or 'category' in col_lower:
            column_mapping[col] = 'classification'
        elif 'issue type' in col_lower or 'issue_type' in col_lower:
            column_mapping[col] = 'issue_type'
        elif 'opened' in col_lower and 'by' not in col_lower:
            column_mapping[col] = 'opened_date'
        elif 'closed' in col_lower:
            column_mapping[col] = 'closed_date'
    
    df_normalized = df.rename(columns=column_mapping)
    return df_normalized

def categorize_issue(description, short_desc, classification, issue_type):
    """
    Categorize if an issue can be addressed by Apple documentation
    Returns: (is_apple_addressable, category, confidence)

    Phase 1 Inclusive Approach:
    - Prioritize Apple-addressable categorization when Apple docs exist
    - Only mark as vendor-specific if clearly a vendor implementation issue
    """
    # Helper function to safely convert to string
    def safe_str(val):
        # Handle Series objects (duplicate columns) first
        if isinstance(val, pd.Series):
            return ' '.join(val.dropna().astype(str).tolist()).lower()
        # Handle single values
        if pd.isna(val):
            return ''
        return str(val).lower()

    # Combine all text fields for analysis
    text = ' '.join([
        safe_str(description),
        safe_str(short_desc),
        safe_str(classification),
        safe_str(issue_type)
    ])

    # First, check for vendor-specific keywords (these take precedence and indicate limited Apple docs)
    for category, keywords in VENDOR_SPECIFIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                return False, f'vendor_{category}', 'high'

    # Check for Apple-addressable keywords (inclusive approach)
    matched_categories = []
    for category, keywords in APPLE_ADDRESSABLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                matched_categories.append(category)
                break

    if matched_categories:
        # Return the first matched category with high confidence
        return True, matched_categories[0], 'high'

    # If no clear match, mark as uncertain (needs manual review)
    return None, 'uncategorized', 'low'

def analyze_tickets(file_path, output_format='json'):
    """
    Main analysis function
    """
    print(f"Analyzing: {file_path}")
    
    # Detect file structure
    df, metadata = detect_file_structure(file_path)
    print(f"Detected format: {metadata['format']}, Header row: {metadata['header_row']}")
    print(f"Total rows: {len(df)}")
    
    # Normalize columns
    df = normalize_columns(df)
    print(f"Normalized columns: {list(df.columns)}")
    
    # Ensure we have the key columns
    required_cols = ['description', 'short_description']
    if not any(col in df.columns for col in required_cols):
        raise ValueError("Could not find description columns in the file")
    
    # Analyze each ticket
    results = []
    apple_addressable = []
    vendor_specific = []
    uncategorized = []

    for idx, row in df.iterrows():
        desc = row.get('description', '')
        short_desc = row.get('short_description', '')
        classification = row.get('classification', '')
        issue_type = row.get('issue_type', '')
        ticket_id = row.get('ticket_id', f'Row_{idx}')

        is_apple, category, confidence = categorize_issue(desc, short_desc, classification, issue_type)

        result = {
            'ticket_id': ticket_id,
            'short_description': short_desc,
            'description': str(desc)[:200] if pd.notna(desc) else '',
            'classification': classification,
            'is_apple_addressable': is_apple,
            'category': category,
            'confidence': confidence
        }

        results.append(result)

        if is_apple is True:
            apple_addressable.append(result)
        elif is_apple is False:
            vendor_specific.append(result)
        else:
            uncategorized.append(result)

    # Calculate frequencies
    apple_categories = Counter([r['category'] for r in apple_addressable])
    vendor_categories = Counter([r['category'] for r in vendor_specific])

    summary = {
        'total_tickets': len(df),
        'apple_addressable': len(apple_addressable),
        'vendor_specific': len(vendor_specific),
        'uncategorized': len(uncategorized),
        'apple_addressable_pct': round(len(apple_addressable) / len(df) * 100, 1) if len(df) > 0 else 0,
        'top_apple_categories': dict(apple_categories.most_common(10)),
        'top_vendor_categories': dict(vendor_categories.most_common(10)),
        'file_metadata': metadata
    }

    return {
        'summary': summary,
        'apple_addressable_tickets': apple_addressable,
        'vendor_specific_tickets': vendor_specific,
        'uncategorized_tickets': uncategorized,
        'all_results': results
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python analyze_tickets.py <excel_file> [output_file]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        results = analyze_tickets(file_path)
        
        # Print summary
        print("\n" + "="*80)
        print("ANALYSIS SUMMARY (Phase 1: Inclusive Approach)")
        print("="*80)
        print(f"Total Tickets: {results['summary']['total_tickets']}")
        print(f"Apple Addressable: {results['summary']['apple_addressable']} ({results['summary']['apple_addressable_pct']}%)")
        print(f"Vendor-Specific (Limited Apple Docs): {results['summary']['vendor_specific']}")
        print(f"Uncategorized (Needs Review): {results['summary']['uncategorized']}")

        print("\nTop Apple-Addressable Categories:")
        for cat, count in results['summary']['top_apple_categories'].items():
            print(f"  {cat}: {count}")

        if results['summary']['top_vendor_categories']:
            print("\nTop Vendor-Specific Categories:")
            for cat, count in results['summary']['top_vendor_categories'].items():
                print(f"  {cat}: {count}")
        
        # Save results
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            print(f"\nResults saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
