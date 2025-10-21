#!/usr/bin/env python3
"""
Test script to demonstrate the expanded categorization
Shows how issues are now categorized with the inclusive Phase 1 approach
"""

# Inline the keyword dictionaries and categorization logic
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

def categorize_issue(description, short_desc, classification, issue_type):
    """
    Categorize if an issue can be addressed by Apple documentation
    Returns: (is_apple_addressable, category, confidence)
    """
    # Combine all text fields for analysis
    text = ' '.join([
        str(description or '').lower(),
        str(short_desc or '').lower(),
        str(classification or '').lower(),
        str(issue_type or '').lower()
    ])

    # First, check for vendor-specific keywords
    for category, keywords in VENDOR_SPECIFIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                return False, f'vendor_{category}', 'high'

    # Check for Apple-addressable keywords
    matched_categories = []
    for category, keywords in APPLE_ADDRESSABLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                matched_categories.append(category)
                break

    if matched_categories:
        return True, matched_categories[0], 'high'

    return None, 'uncategorized', 'low'

# Test cases showing the difference between old and new categorization
test_cases = [
    {
        "description": "User unable to enroll device in MDM",
        "short_desc": "MDM enrollment failing",
        "classification": "Device Management",
        "issue_type": "Enrollment",
        "expected": "Apple-addressable (mdm_management)",
        "note": "NEW: General MDM enrollment is documented by Apple"
    },
    {
        "description": "JAMF Pro policy not deploying to endpoints",
        "short_desc": "JAMF policy issue",
        "classification": "MDM",
        "issue_type": "Policy",
        "expected": "Vendor-specific (vendor_jamf_specific)",
        "note": "Still vendor-specific because it's JAMF Pro specific"
    },
    {
        "description": "Can't connect to corporate file share",
        "short_desc": "File share access problem",
        "classification": "Network",
        "issue_type": "File Sharing",
        "expected": "Apple-addressable (file_sharing)",
        "note": "NEW: SMB/file sharing is documented by Apple"
    },
    {
        "description": "Active Directory domain join failing",
        "short_desc": "AD domain join issue",
        "classification": "Authentication",
        "issue_type": "Directory Services",
        "expected": "Apple-addressable (enterprise_auth)",
        "note": "NEW: AD integration is documented by Apple"
    },
    {
        "description": "802.1X wireless authentication not working",
        "short_desc": "Enterprise Wi-Fi problem",
        "classification": "Network",
        "issue_type": "Wireless",
        "expected": "Apple-addressable (enterprise_network)",
        "note": "NEW: 802.1X is documented by Apple"
    },
    {
        "description": "Cisco AnyConnect VPN client crashes",
        "short_desc": "VPN client crashing",
        "classification": "Network",
        "issue_type": "VPN",
        "expected": "Vendor-specific (vendor_vendor_vpn_clients)",
        "note": "Still vendor-specific - third-party VPN client"
    },
    {
        "description": "Package installation failing on Mac",
        "short_desc": "App deployment issue",
        "classification": "Software",
        "issue_type": "Installation",
        "expected": "Apple-addressable (app_deployment)",
        "note": "NEW: Package installation is documented by Apple"
    },
    {
        "description": "Slack application keeps crashing",
        "short_desc": "Slack crash",
        "classification": "Application",
        "issue_type": "Crash",
        "expected": "Vendor-specific (vendor_third_party_app_issues)",
        "note": "Still vendor-specific - third-party app problem"
    },
    {
        "description": "Migration Assistant not transferring data",
        "short_desc": "Migration Assistant issue",
        "classification": "Setup",
        "issue_type": "Migration",
        "expected": "Apple-addressable (device_lifecycle)",
        "note": "NEW: Migration Assistant is documented by Apple"
    },
    {
        "description": "macOS update stuck downloading",
        "short_desc": "Update problem",
        "classification": "Updates",
        "issue_type": "System Update",
        "expected": "Apple-addressable (macos_update)",
        "note": "EXISTING: Always was Apple-addressable"
    }
]

def main():
    print("="*80)
    print("CATEGORIZATION TEST - Phase 1 Inclusive Approach")
    print("="*80)
    print()
    print("Legend:")
    print("  [EXISTING] = Was already categorized as Apple-addressable")
    print("  [NEW]      = Now categorized as Apple-addressable (previously enterprise IT)")
    print("  [VENDOR]   = Vendor-specific (requires vendor support)")
    print()
    print("="*80)
    print()

    for i, test in enumerate(test_cases, 1):
        is_apple, category, confidence = categorize_issue(
            test["description"],
            test["short_desc"],
            test["classification"],
            test["issue_type"]
        )

        # Determine status
        if is_apple is True:
            status = "Apple-addressable"
            symbol = "✓"
            tag = "[NEW]     " if "NEW:" in test["note"] else "[EXISTING]"
        elif is_apple is False:
            status = "Vendor-specific"
            symbol = "⊘"
            tag = "[VENDOR]  "
        else:
            status = "Uncategorized"
            symbol = "?"
            tag = "[UNKNOWN] "

        print(f"{tag} Test {i}: {test['short_desc']}")
        print(f"         Description: {test['description']}")
        print(f"         Result: {symbol} {status} - {category} (confidence: {confidence})")
        print(f"         Note: {test['note']}")
        print()

    print("="*80)
    print("SUMMARY")
    print("="*80)

    apple_count = sum(1 for t in test_cases if "NEW:" in t["note"] and "Apple-addressable" in t["expected"])
    vendor_count = sum(1 for t in test_cases if "vendor-specific" in t["expected"].lower())
    existing_count = sum(1 for t in test_cases if "EXISTING:" in t["note"])

    print(f"Total test cases: {len(test_cases)}")
    print(f"  - Newly Apple-addressable: {apple_count}")
    print(f"  - Already Apple-addressable: {existing_count}")
    print(f"  - Vendor-specific: {vendor_count}")
    print()
    print("Phase 1 Impact: More issues can now be addressed with Apple documentation!")
    print()

if __name__ == '__main__':
    main()
