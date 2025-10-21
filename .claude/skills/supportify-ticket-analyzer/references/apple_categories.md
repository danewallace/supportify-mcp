# Apple-Addressable Issue Categories

This reference document defines which support issues can be addressed using Apple's official documentation, support articles, platform guides, and security guidance.

## Issue Categories

### 1. macOS Updates & Upgrades

**Description:** Issues related to updating or upgrading macOS to newer versions

**Keywords:**
- macOS update, OS update, system update
- OS upgrade, macOS upgrade
- Version names: Sequoia, Sonoma, Ventura, Monterey, Big Sur
- Software update, system software

**Apple Resources:**
- macOS User Guide: https://support.apple.com/guide/mac-help
- Update macOS: https://support.apple.com/HT201541
- macOS Compatibility: Platform-specific compatibility guides
- macOS Release Notes: Developer documentation

**Common Issues:**
- Update won't download or install
- Insufficient disk space for update
- Update stuck or frozen
- Compatibility concerns
- Post-update issues

---

### 2. Login & Authentication Issues

**Description:** Problems accessing the Mac or user account

**Keywords:**
- Login issue, login problem
- Password, authentication
- FileVault, encryption
- Keychain, credentials
- iCloud login, Apple ID

**Apple Resources:**
- Password reset procedures
- FileVault documentation
- Keychain Access guide
- Authentication troubleshooting

**Common Issues:**
- Forgotten password
- FileVault recovery
- Keychain access problems
- Apple ID authentication
- User account locked

---

### 3. Hardware Issues

**Description:** Physical hardware problems with Mac devices

**Keywords:**
- Hardware, battery, display
- Keyboard, trackpad, mouse
- SSD, storage, memory
- Thermal, overheating, fan
- Ports, connectivity

**Apple Resources:**
- Apple Diagnostics: https://support.apple.com/HT202731
- Mac hardware specifications
- Battery health information
- Service and repair guides
- Warranty and AppleCare documentation

**Common Issues:**
- Battery not charging or draining quickly
- Display issues (flickering, dead pixels)
- Keyboard or trackpad malfunction
- Overheating or loud fan noise
- Storage failures

---

### 4. Wi-Fi & Network Issues

**Description:** Wireless network connectivity problems

**Keywords:**
- WiFi, wireless, Wi-Fi
- Network connection, internet connection
- Airport (legacy)
- Network preferences

**Apple Resources:**
- Wi-Fi troubleshooting guides
- Network diagnostics
- Router recommendations
- Network security settings

**Common Issues:**
- Can't connect to Wi-Fi
- Intermittent connectivity
- Slow network speeds
- Wi-Fi keeps disconnecting
- Network settings reset

---

### 5. VPN Issues

**Description:** Virtual Private Network configuration and connection issues

**Keywords:**
- VPN, virtual private network
- VPN connection, VPN setup

**Apple Resources:**
- VPN configuration guides
- Built-in VPN client documentation
- Network extension framework (for developers)

**Common Issues:**
- VPN won't connect
- VPN connection drops
- VPN configuration problems

**Note:** Enterprise VPN solutions may require additional vendor-specific support

---

### 6. Performance Issues

**Description:** System slowness, freezing, or crashes

**Keywords:**
- Slow, performance, lag
- Freeze, hang, unresponsive
- Crash, quit unexpectedly
- System data, storage full
- Memory, RAM

**Apple Resources:**
- Performance troubleshooting
- Storage management
- Activity Monitor usage
- Safe Mode procedures
- System maintenance

**Common Issues:**
- Mac running slowly
- Applications freezing or crashing
- High CPU or memory usage
- Storage nearly full (System Data)
- Startup problems

---

### 7. Native Apple Applications

**Description:** Issues with built-in macOS applications

**Keywords:**
- Mail app, Safari, Messages
- FaceTime, Calendar, Notes
- Reminders, Photos, Music
- iWork apps (Pages, Numbers, Keynote)

**Apple Resources:**
- Individual app user guides
- App-specific troubleshooting
- iCloud integration documentation

**Common Issues:**
- Mail not syncing
- Safari crashes or slow
- Messages not delivering
- Calendar sync problems

---

### 8. Bluetooth & Continuity

**Description:** Bluetooth device connectivity and Apple ecosystem features

**Keywords:**
- Bluetooth, wireless
- AirDrop, Handoff
- Continuity, Universal Control
- Sidecar

**Apple Resources:**
- Bluetooth setup and troubleshooting
- Continuity feature guides
- AirDrop documentation
- Universal Control setup

**Common Issues:**
- Bluetooth devices won't pair
- AirDrop not working
- Handoff not functioning
- Continuity features unavailable

---

### 9. Printing Issues

**Description:** Printer setup and printing problems

**Keywords:**
- Print, printer, printing
- AirPrint
- Print queue

**Apple Resources:**
- Printer setup guides
- AirPrint documentation
- CUPS (Common Unix Printing System) basics
- Troubleshooting print issues

**Common Issues:**
- Can't add printer
- Print jobs stuck in queue
- Printer not responding
- Print quality problems

---

### 10. Privacy & Security Settings

**Description:** System privacy settings and permissions

**Keywords:**
- Permissions, access
- Security & Privacy
- System Preferences
- System Settings (macOS Ventura+)
- Gatekeeper, XProtect

**Apple Resources:**
- Privacy & Security guide
- App permissions documentation
- Gatekeeper and security features
- FileVault and encryption

**Common Issues:**
- App permission problems
- Security settings locked
- Gatekeeper blocking apps
- Privacy concerns

---

### 11. MDM & Device Management

**Description:** Mobile Device Management, enrollment, and enterprise device configuration

**Keywords:**
- MDM, mobile device management
- Apple Business Manager, ABM
- Apple School Manager, ASM
- Device enrollment, DEP, ADE
- Configuration profile, profile installation
- Remote management, device management

**Apple Resources:**
- Apple Business Manager User Guide
- Apple School Manager documentation
- MDM and Apple Business Manager: https://support.apple.com/guide/deployment/
- Device Enrollment Program documentation
- Configuration Profile Reference
- Platform Deployment guides

**Common Issues:**
- MDM enrollment problems
- Profile installation failures
- Apple Business Manager setup
- Device assignment and management
- Configuration profile conflicts

**Note:** While vendor-specific MDM platforms (JAMF, Intune, Kandji) have their own documentation, Apple provides extensive guidance on MDM protocols, enrollment, and device management fundamentals.

---

### 12. Application Deployment & Management

**Description:** Installing, updating, and managing applications on macOS

**Keywords:**
- App deployment, application installation
- App update, software update
- Package installation, .pkg, .dmg
- App Store deployment
- Managed apps
- Application preferences
- Uninstall, remove application

**Apple Resources:**
- Deploying apps: https://support.apple.com/guide/deployment/
- Mac App Store for Business
- Package creation and deployment
- Application preferences management
- Installer Package formats

**Common Issues:**
- App won't install
- Application update failures
- Package deployment issues
- App Store authentication problems
- Preference management

**Note:** Third-party app-specific issues still require vendor support, but the installation, deployment mechanisms, and macOS application architecture are documented by Apple.

---

### 13. Enterprise Authentication & Directory Services

**Description:** Active Directory, Kerberos, LDAP, and enterprise authentication

**Keywords:**
- Active Directory, AD, domain
- Kerberos, SSO, single sign-on
- LDAP, directory services
- Enterprise authentication
- Network account, domain account
- Certificate authentication

**Apple Resources:**
- Integrating macOS with Active Directory: https://support.apple.com/guide/deployment/
- Kerberos authentication on Mac
- Network account configuration
- Certificate-based authentication
- Directory Services on macOS

**Common Issues:**
- Can't join domain
- Kerberos ticket problems
- LDAP authentication failures
- Certificate authentication issues
- Network account login problems

**Note:** Apple provides comprehensive documentation for integrating macOS with enterprise directory services.

---

### 14. Enterprise Network Configuration

**Description:** Corporate network infrastructure, proxy, certificates, and enterprise Wi-Fi

**Keywords:**
- Corporate network, enterprise network
- Proxy server, proxy configuration
- 802.1X, network authentication
- Certificate installation, enterprise certificate
- Network access control, NAC
- Corporate VPN, enterprise VPN

**Apple Resources:**
- Network configuration: https://support.apple.com/guide/deployment/
- 802.1X configuration profiles
- Certificate management
- Proxy settings and PAC files
- VPN configuration (L2TP, IKEv2, IPsec)
- Network extension framework

**Common Issues:**
- Proxy configuration problems
- 802.1X Wi-Fi authentication
- Certificate installation issues
- Enterprise VPN setup
- Network access control problems

**Note:** While specific vendor VPN clients may need vendor support, Apple's built-in VPN capabilities and network configuration are well-documented.

---

### 15. File Sharing & Network Access

**Description:** SMB file shares, AFP, network drives, and permissions

**Keywords:**
- File share, network share
- SMB, CIFS, AFP
- Connect to server
- Network drive, mounted volume
- File permissions, folder access
- Group membership

**Apple Resources:**
- File Sharing on Mac: https://support.apple.com/guide/mac-help/
- SMB file sharing configuration
- Network file system access
- Permission troubleshooting
- Server connection management

**Common Issues:**
- Can't connect to file share
- Permission denied errors
- Network drive mounting problems
- File sharing authentication
- Group access issues

**Note:** General file sharing and macOS permission systems are documented by Apple, though enterprise-specific permission policies may need IT support.

---

### 16. Software Updates & Patch Management

**Description:** System and application updates, update policies, and management

**Keywords:**
- Software update, system update
- macOS update policy
- Managed software update
- Update catalog, update server
- Deferred updates, delayed updates

**Apple Resources:**
- Managing software updates: https://support.apple.com/guide/deployment/
- Software Update service
- Update scheduling and deferral
- macOS update catalog
- Update troubleshooting

**Common Issues:**
- Updates not appearing
- Update policy conflicts
- Deferred update problems
- Software Update service issues

---

### 17. Device Lifecycle & Provisioning

**Description:** Device setup, imaging, migration, and decommissioning

**Keywords:**
- Device setup, Mac setup
- Migration Assistant, data migration
- Setup Assistant
- Erase Mac, factory reset
- Activation Lock
- Device transfer, ownership transfer

**Apple Resources:**
- Mac setup and migration: https://support.apple.com/guide/mac-help/
- Migration Assistant documentation
- Erase and reinstall macOS
- Activation Lock management: https://support.apple.com/HT201441
- Setup Assistant customization
- Apple Configurator for Mac

**Common Issues:**
- Migration problems
- Activation Lock removal
- Setup Assistant issues
- Erase and reinstall failures
- Device transfer problems

**Note:** Enterprise Activation Lock removal requires Apple Business Manager, which is documented by Apple.

---

### 18. General macOS Issues

**Description:** Miscellaneous macOS issues that don't fit specific categories but can still benefit from Apple documentation and troubleshooting guides

**Keywords:**
- Any Mac-related issue not matching specific categories above
- General troubleshooting
- System behavior
- User experience issues

**Apple Resources:**
- macOS User Guide: https://support.apple.com/guide/mac-help
- Apple Support: https://support.apple.com/mac
- Apple Platform Deployment: https://support.apple.com/guide/deployment
- Apple Security Updates: https://support.apple.com/HT201222
- Apple Support Communities: https://discussions.apple.com

**Common Issues:**
- Various user-reported problems
- General system questions
- Feature requests or usage questions
- Unspecified technical issues

**Categorization Logic:**
- This is the DEFAULT category for tickets uploaded to the analysis tool
- Since users upload Apple help desk data, we assume issues are Apple-addressable unless they're clearly vendor-specific
- Maximizes the utility of Apple documentation for ticket deflection
- Confidence level: Medium (may benefit from manual review for better categorization)

---

## Issues with LIMITED Apple Documentation

These issues require vendor-specific support and have limited or no Apple documentation:

### Vendor-Specific MDM Platforms
- **JAMF Pro**: JAMF-specific policies, smart groups, scripts, workflows
- **Microsoft Intune**: Intune-specific configuration, compliance rules, app deployment
- **Kandji, Mosyle, Addigy**: Platform-specific features and troubleshooting
- **Custom MDM solutions**: Proprietary implementations and workflows

**Note:** General MDM concepts and Apple's MDM protocol ARE documented by Apple (see Category 11).

---

### Third-Party Application Issues
- **Vendor-specific bugs**: Application crashes, errors within third-party software
- **Software licensing**: License activation, subscription management for non-Apple software
- **Custom enterprise applications**: In-house developed software
- **Plugin/extension issues**: Third-party Safari extensions, system extensions from vendors

**Note:** General app installation, permissions, and deployment mechanisms ARE documented by Apple (see Category 12).

---

### Vendor-Specific VPN Clients
- **Cisco AnyConnect**: Client-specific configuration and troubleshooting
- **Palo Alto GlobalProtect**: Platform-specific issues
- **Zscaler, Cloudflare WARP**: Vendor client problems
- **Custom VPN solutions**: Proprietary implementations

**Note:** Built-in macOS VPN (L2TP, IKEv2, IPsec) IS documented by Apple (see Categories 5 and 14).

---

### Enterprise Asset Management
- **Inventory systems**: Asset tracking software, inventory databases
- **Service desk platforms**: ServiceNow, Jira Service Management configuration
- **Procurement processes**: Device ordering, provisioning workflows
- **Compliance reporting**: Vendor-specific compliance tools and dashboards

---

### Organization-Specific Policies
- **Custom security policies**: Organization-defined security requirements
- **Compliance frameworks**: Industry-specific compliance (HIPAA, SOC2, etc.)
- **Access control policies**: Company-specific permission schemes
- **Data retention policies**: Organization-defined data management

---

## Using This Reference

When analyzing support tickets:

1. **Extract keywords** from ticket descriptions
2. **Match to Apple-addressable categories** (Categories 1-17) using the keywords above
3. **Be inclusive** - Prioritize Apple documentation when available, even for enterprise scenarios
4. **Check for vendor-specific context** - Only categorize as "limited documentation" if:
   - The issue is specific to a vendor's implementation (e.g., "JAMF policy not applying")
   - The problem is with a third-party product itself (e.g., "Slack won't launch")
   - It requires access to organization-specific systems or policies
5. **Flag uncertain cases** for manual review
6. **Link to Apple resources** when categorizing as Apple-addressable

## Categorization Philosophy

**Highly Inclusive Approach:**
- **Assume Apple-addressable by default** - Since users upload Apple help desk data, tickets are assumed to be Mac-related issues that can benefit from Apple documentation
- Only exclude tickets that are clearly vendor-specific (JAMF policies, third-party app crashes, vendor VPN clients, etc.)
- Recognize that Apple provides extensive enterprise and deployment documentation
- MDM, authentication, networking, and app deployment are documented by Apple
- Maximizes ticket deflection opportunities with Apple documentation

**Default Behavior:**
- Tickets matching specific categories (1-17) → Categorized with high confidence
- Tickets without clear category matches → Categorized as "General macOS Issues" (Category 18) with medium confidence
- Only vendor-specific keyword matches → Excluded as "Limited documentation"

**Examples:**
- "Computer won't start" → **Apple-addressable** (Category 18: General macOS Issues)
- "MDM enrollment failing" → **Apple-addressable** (Category 11: MDM & Device Management)
- "JAMF policy not deploying" → **Limited documentation** (requires JAMF-specific knowledge)
- "Can't connect to file share" → **Apple-addressable** (Category 15: File Sharing)
- "Slack app crashing" → **Limited documentation** (third-party app issue)
- "VPN won't connect" → **Apple-addressable** (Category 14: Enterprise Network or Category 18)
- "Cisco AnyConnect issues" → **Limited documentation** (vendor-specific client)
- "Screen flickering occasionally" → **Apple-addressable** (Category 18: General macOS Issues)

## Confidence Levels

- **High Confidence:** Clear keyword matches with Apple documentation available (Categories 1-17)
- **Medium Confidence:** No specific category match, but assumed Apple-addressable (Category 18)
- Vendor-specific issues are marked as "Limited documentation" and excluded from Apple-addressable count

## Integration with Supportify MCP

When the Supportify MCP's Apple documentation tools are available:
- Use `searchAppleDocumentation` to find specific KB articles
- Use `fetchAppleDocumentation` to retrieve detailed guidance
- Cross-reference with Human Interface Guidelines for UI/UX issues
- Leverage Apple Developer documentation for technical deep-dives
