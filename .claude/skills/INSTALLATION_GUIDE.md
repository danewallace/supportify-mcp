# Supportify Ticket Analyzer - Installation Guide

## Quick Start

### 1. Install the Skill
1. Go to https://claude.ai
2. Click your profile → Settings → Skills
3. Click "Add Skill"
4. Upload `supportify-ticket-analyzer.skill`
5. Done! ✅

### 2. Install Python Dependencies (if using locally)
```bash
pip install pandas openpyxl python-docx --break-system-packages
```

### 3. Use the Skill
Upload any help desk Excel file to Claude and say:
```
"Analyze these Mac support tickets and show me which issues 
can be addressed by Apple documentation"
```

Claude will automatically:
- ✅ Detect your file format
- ✅ Categorize all tickets
- ✅ Generate comprehensive reports
- ✅ Provide Apple support article links
- ✅ Give you download links for documentation

---

## What to Expect

### Input
Any Excel file (.xls or .xlsx) containing Mac support tickets with descriptions.

**The file can have any structure** - the skill auto-detects:
- Column names (Number, Description, Category, etc.)
- Header row location
- Data format

**Common formats supported:**
- ServiceNow exports
- Jira exports
- JAMF reports
- Custom help desk exports

### Output
You'll receive:
1. **Analysis Summary** - Statistics on Apple-addressable vs Enterprise IT issues
2. **Categorized Results** - Tickets grouped by issue type
3. **Documentation Files** - Reports in Markdown, DOCX, and optionally PDF
4. **Apple Resources** - Links to relevant support articles for each category

---

## Example Conversation

```
You: [uploads tickets.xlsx]
     "Analyze these Mac support tickets"

Claude: I'll analyze your support tickets using the Supportify skill...
        
        [Runs analysis]
        
        Analysis Complete:
        
        📊 Summary
        - Total tickets: 245
        - Apple-addressable: 32 (13.1%)
        - Enterprise IT: 198 (80.8%)
        - Uncategorized: 15 (6.1%)
        
        🔝 Top Apple Issues:
        1. macOS updates (12 tickets)
        2. Performance/storage (8 tickets)
        3. Hardware issues (6 tickets)
        
        📄 Documentation Generated:
        [Provides download links for reports]
        
        💡 Insights:
        These 32 tickets could potentially be self-served with 
        better documentation linking to Apple's support articles.
```

---

## File Requirements

### Minimum Requirements
Your Excel file should have at least one of these columns (any name variation works):
- Description field: "Description", "Short Description", "Summary", "Issue"
- Ticket ID: "Number", "Ticket ID", "Incident", "ID"

### Optional but Helpful
- Category: "Classification", "Category", "Type"
- Assignment: "Assignment Group", "Team"
- Dates: "Opened", "Closed", "Created"

**The skill is very flexible** - even with minimal columns, it will extract and categorize what's available.

---

## Understanding Results

### Apple-Addressable Categories (10 types)
Issues that can be resolved with Apple documentation:
- macOS updates
- Login/authentication
- Hardware problems
- Wi-Fi/network
- VPN configuration
- Performance/storage
- Native Apple apps
- Bluetooth/AirDrop
- Printing
- Privacy/permissions

### Enterprise IT Categories (5 types)
Issues requiring IT support (not Apple-addressable):
- JAMF/MDM enrollment
- Device provisioning
- Third-party applications
- Active Directory
- Corporate network

### Uncategorized
Tickets with insufficient information - these may need manual review or better descriptions.

---

## Advanced Usage

### Generate Different Report Formats

**Markdown (for wikis):**
```
"Generate a markdown report of the analysis"
```

**DOCX (for presentations):**
```
"Create a Word document report for management"
```

**PDF (for distribution):**
```
"Generate a PDF report"
```

### Compare Time Periods
```
[Upload multiple files]
"Compare ticket trends across these three months"
```

### Focus on Specific Categories
```
"Show me only the hardware-related tickets and their Apple resources"
```

### Custom Analysis
```
"Which issues appear most frequently and have the highest resolution time?"
```

---

## Supportify MCP Integration

If you have the Supportify MCP connected, the skill automatically enhances reports with:
- ✅ Live Apple documentation searches
- ✅ Detailed KB article content
- ✅ Developer documentation references
- ✅ Security guide links

**No configuration needed** - the skill detects and uses MCP when available.

---

## Data Privacy

**Important:** This skill does NOT store any customer data.

- ✅ All processing is temporary
- ✅ Files are only saved where you specify
- ✅ No persistent storage
- ✅ No external data transmission (except optional Apple doc lookups)
- ✅ Completely stateless

Your customer data remains private and under your control.

---

## Troubleshooting

**"Can't find description columns"**
- Your file may have unusual column names
- Claude will try to adapt, but you can rename columns if needed

**"Many uncategorized tickets"**
- Descriptions may be too brief
- Consider adding more detail to ticket descriptions
- You can manually review and categorize these

**"Need different output format"**
- Just ask! "Generate this in [format]"
- Supported: Markdown, DOCX, PDF, JSON

**"Want to customize categories"**
- Contact me to adjust keyword lists
- Can add industry-specific terms
- Can create custom categories

---

## Support

For questions or issues:
1. Check this guide
2. Ask Claude for help (it knows how to use the skill)
3. Request modifications or enhancements

The skill is designed to be intuitive - if you can upload an Excel file and type a question, you can use this skill!

---

## Next Steps

1. ✅ Install the skill
2. ✅ Upload your first help desk data file
3. ✅ Review the analysis
4. ✅ Share documentation with your team
5. ✅ Track improvements over time

**Ready to start reducing your Mac support ticket volume!** 🚀
