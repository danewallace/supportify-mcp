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

## Issues NOT Addressable by Apple Documentation

These issues require enterprise IT, vendor-specific, or third-party support:

### Enterprise MDM (JAMF, Intune, etc.)
- Device enrollment and provisioning
- MDM profile installation
- Remote management
- Compliance policies

### Device Lifecycle Management
- Device decommissioning
- Activation lock removal (enterprise)
- Asset tracking and inventory
- Device transfers

### Third-Party Applications
- Application deployment (non-Apple apps)
- Software licensing
- Custom enterprise applications
- Application updates (third-party)

### Enterprise Authentication
- Active Directory integration
- Kerberos configuration
- LDAP setup
- SSO (Single Sign-On) configuration

### Enterprise Network Infrastructure
- Corporate VPN (vendor-specific)
- Proxy server configuration
- Network access control (NAC)
- Enterprise Wi-Fi (802.1X with certificates)

### Group Policy & Permissions
- File share access
- Group memberships
- Enterprise permissions
- Resource access

---

## Using This Reference

When analyzing support tickets:

1. **Extract keywords** from ticket descriptions
2. **Match to Apple-addressable categories** using the keywords above
3. **Verify context** - even Apple-related issues may need enterprise IT if:
   - They're part of a deployment process
   - They require MDM intervention
   - They involve enterprise infrastructure
4. **Flag uncertain cases** for manual review
5. **Link to Apple resources** when categorizing as Apple-addressable

## Confidence Levels

- **High Confidence:** Clear keyword matches, standard consumer scenarios
- **Medium Confidence:** Some keyword matches but context unclear
- **Low Confidence:** Ambiguous description, may need human review

## Integration with Supportify MCP

When the Supportify MCP's Apple documentation tools are available:
- Use `searchAppleDocumentation` to find specific KB articles
- Use `fetchAppleDocumentation` to retrieve detailed guidance
- Cross-reference with Human Interface Guidelines for UI/UX issues
- Leverage Apple Developer documentation for technical deep-dives
