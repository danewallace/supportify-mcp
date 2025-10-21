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

# Keywords for Apple-addressable issues
APPLE_ADDRESSABLE_KEYWORDS = {
    'macos_update': ['macos update', 'os update', 'system update', 'os upgrade', 'macos upgrade', 'sequoia', 'sonoma', 'ventura'],
    'login_issue': ['login issue', 'login problem', 'password', 'authentication', 'filevault', 'keychain', 'icloud login'],
    'hardware_issue': ['hardware', 'battery', 'display', 'keyboard', 'trackpad', 'ssd', 'storage', 'memory', 'thermal', 'overheating'],
    'wifi_network': ['wifi', 'wireless', 'network connection', 'internet connection', 'wi-fi', 'airport'],
    'vpn_issue': ['vpn', 'virtual private network'],
    'performance': ['slow', 'performance', 'freeze', 'hang', 'crash', 'system data', 'storage full'],
    'native_apps': ['mail app', 'safari', 'messages', 'facetime', 'calendar app', 'notes app', 'reminders'],
    'bluetooth': ['bluetooth', 'airdrop', 'handoff', 'continuity'],
    'printer': ['print', 'printer', 'airprint'],
    'permissions': ['permissions', 'security & privacy', 'system preferences', 'system settings']
}

# Keywords for non-Apple (enterprise IT) issues
ENTERPRISE_IT_KEYWORDS = {
    'jamf': ['jamf', 'mdm', 'enrollment', 'provisioning', 'remote management', 'profile'],
    'decommission': ['decommission', 'wipe', 'activation lock', 'remove device'],
    'third_party_apps': ['lucidlink', 'chester', 'slack deployment', 'chrome', 'zoom', 'application update'],
    'enterprise_auth': ['active directory', 'ad', 'domain', 'kerberos', 'corporate credentials'],
    'enterprise_network': ['corp wifi', 'corporate vpn', 'proxy']
}

def detect_file_structure(file_path):
    """
    Detect the structure of the Excel file and determine header row
    Returns: (dataframe, metadata)
    """
    # Try reading with different header rows
    for header_row in [0, 1, 2]:
        try:
            df = pd.read_excel(file_path, header=header_row)
            
            # Check if we have meaningful column names
            if 'Number' in df.columns or 'Description' in df.columns or 'Short description' in df.columns:
                return df, {'header_row': header_row, 'format': 'standard'}
        except Exception:
            continue
    
    # If no standard format found, read as-is
    df = pd.read_excel(file_path)
    return df, {'header_row': 0, 'format': 'unknown'}

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
    
    # Check for enterprise IT keywords first (these take precedence)
    for category, keywords in ENTERPRISE_IT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                return False, f'enterprise_{category}', 'high'
    
    # Check for Apple-addressable keywords
    matched_categories = []
    for category, keywords in APPLE_ADDRESSABLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                matched_categories.append(category)
                break
    
    if matched_categories:
        return True, matched_categories[0], 'high'
    
    # If no clear match, mark as uncertain
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
    enterprise_it = []
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
            enterprise_it.append(result)
        else:
            uncategorized.append(result)
    
    # Calculate frequencies
    apple_categories = Counter([r['category'] for r in apple_addressable])
    enterprise_categories = Counter([r['category'] for r in enterprise_it])
    
    summary = {
        'total_tickets': len(df),
        'apple_addressable': len(apple_addressable),
        'enterprise_it': len(enterprise_it),
        'uncategorized': len(uncategorized),
        'apple_addressable_pct': round(len(apple_addressable) / len(df) * 100, 1) if len(df) > 0 else 0,
        'top_apple_categories': dict(apple_categories.most_common(10)),
        'top_enterprise_categories': dict(enterprise_categories.most_common(10)),
        'file_metadata': metadata
    }
    
    return {
        'summary': summary,
        'apple_addressable_tickets': apple_addressable,
        'enterprise_it_tickets': enterprise_it,
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
        print("ANALYSIS SUMMARY")
        print("="*80)
        print(f"Total Tickets: {results['summary']['total_tickets']}")
        print(f"Apple Addressable: {results['summary']['apple_addressable']} ({results['summary']['apple_addressable_pct']}%)")
        print(f"Enterprise IT: {results['summary']['enterprise_it']}")
        print(f"Uncategorized: {results['summary']['uncategorized']}")
        
        print("\nTop Apple-Addressable Categories:")
        for cat, count in results['summary']['top_apple_categories'].items():
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
