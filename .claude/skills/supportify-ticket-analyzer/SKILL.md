---
name: supportify-ticket-analyzer
description: Analyze help desk Excel files (.xls, .xlsx) containing Mac support tickets. Categorizes incidents to identify which issues can be addressed by Apple documentation versus enterprise IT operations. Generates comprehensive reports in markdown, DOCX, and PDF formats with frequency analysis and Apple support article recommendations. Use when users upload help desk data files or ask to analyze support ticket patterns.
---

# Supportify Ticket Analyzer

## Overview

This skill analyzes help desk ticket data from Excel files to identify Mac support issues that can be resolved using Apple's official documentation, platform guides, and support articles. It distinguishes between Apple-addressable issues (macOS updates, hardware problems, network issues) and enterprise IT operations (JAMF provisioning, third-party app deployment, decommissioning).

The skill integrates with the Supportify MCP, which provides access to Apple Developer documentation and support articles for generating targeted help desk documentation.

## Usage Context

**This skill is designed for command-line environments:**
- **Claude Code** - Primary use case for agentic coding workflows
- **Enchanted** and other GUI applications with file system access
- **Terminal/CLI** environments where Claude has direct file access

In these environments, Claude can:
- Directly access file paths provided by the user
- Execute Python scripts without abstraction layers
- Write output files to user-specified directories
- Work with local file systems naturally

## Quick Start for Claude Code

When a user provides a help desk Excel file:

1. **Immediately execute the analysis script:**
   ```bash
   python scripts/analyze_tickets.py /path/to/tickets.xlsx analysis.json
   ```

2. **Review the JSON output** (it prints a summary automatically)

3. **Generate documentation:**
   ```bash
   python scripts/generate_docs.py analysis.json ./output/
   ```

4. **Present results** with file paths to the generated documentation

**No intermediate steps needed** - just run the scripts and provide results.

## Workflow

### Step 1: Locate the Skill Scripts

The skill includes two main scripts in the `scripts/` directory:
- `analyze_tickets.py` - Parses Excel files and categorizes tickets
- `generate_docs.py` - Creates documentation from analysis results

**In Claude Code environments**, these scripts are available in the skill directory and can be executed directly.

### Step 2: Execute Analysis

Run the analysis script with the user's Excel file path:

```bash
cd /path/to/skill/supportify-ticket-analyzer
python scripts/analyze_tickets.py /path/to/user/tickets.xlsx output_analysis.json
```

**The script automatically:**
- Detects file structure (handles ServiceNow, Jira, JAMF, custom formats)
- Normalizes column names across different vendor formats
- Categorizes each ticket as Apple-addressable or Enterprise IT
- Outputs summary statistics to console
- Saves detailed JSON results to the specified path

**Console output includes:**
```
Analyzing: /path/to/tickets.xlsx
Detected format: standard, Header row: 0
Total rows: 374

================================================================================
ANALYSIS SUMMARY
================================================================================
Total Tickets: 374
Apple Addressable: 23 (6.1%)
Enterprise IT: 320
Uncategorized: 31

Top Apple-Addressable Categories:
  macos_update: 8
  performance: 5
  hardware_issue: 4
```

### Step 3: Generate Documentation

Create reports in multiple formats:

```bash
python scripts/generate_docs.py output_analysis.json /path/to/output/directory/
```

**Generates:**
- `support_analysis.md` - Markdown report
- `support_analysis.docx` - Word document
- `support_analysis.pdf` - PDF (if pandoc/weasyprint available)

### Step 4: Present Results

Provide the user with:
1. **Summary statistics** from console output
2. **File paths** to generated documentation
3. **Key insights** about Apple-addressable issues
4. **Links to Apple KB articles** for top categories

**Example response:**
```
Analysis complete! 

📊 Results:
- 374 tickets analyzed
- 23 (6.1%) can be addressed by Apple documentation
- Top issues: macOS updates (8), performance (5), hardware (4)

📄 Documentation generated:
- Markdown: /output/support_analysis.md
- DOCX: /output/support_analysis.docx

💡 The 23 Apple-addressable tickets represent self-service 
opportunities through better documentation.
```

## Common Use Cases for Claude Code

### Use Case 1: Quick Analysis

**User:** "Analyze `/home/user/tickets/march_2025.xlsx` and show me the breakdown"

**Claude Code workflow:**
```bash
python scripts/analyze_tickets.py /home/user/tickets/march_2025.xlsx analysis.json
# Review console output
# Present summary to user
```

### Use Case 2: Generate Full Report

**User:** "Create a complete report with documentation in my `~/reports` folder"

**Claude Code workflow:**
```bash
# Run analysis
python scripts/analyze_tickets.py ~/tickets/data.xlsx ~/reports/analysis.json

# Generate docs
python scripts/generate_docs.py ~/reports/analysis.json ~/reports/

# Present results
echo "Reports generated in ~/reports/"
ls -lh ~/reports/
```

### Use Case 3: Batch Processing

**User:** "Analyze all Excel files in my tickets directory"

**Claude Code workflow:**
```bash
mkdir -p ~/analysis_results

for file in ~/tickets/*.xlsx; do
    filename=$(basename "$file" .xlsx)
    python scripts/analyze_tickets.py "$file" "~/analysis_results/${filename}_analysis.json"
    python scripts/generate_docs.py "~/analysis_results/${filename}_analysis.json" "~/analysis_results/${filename}/"
done

# Summarize results
echo "Analysis complete for all files in ~/tickets/"
```

### Use Case 4: Enhanced with MCP

**User:** "Analyze these tickets and fetch Apple KB articles for the top issues"

**Claude Code workflow:**
```bash
# Run analysis
python scripts/analyze_tickets.py tickets.xlsx analysis.json

# Parse results to get top categories
# Then use Supportify MCP:
# searchAppleDocumentation("macOS update issues")
# fetchAppleDocumentation("/documentation/macos/update")

# Generate enhanced documentation with MCP results
python scripts/generate_docs.py analysis.json ./reports/
```

## Apple-Addressable Issue Categories

For detailed information about which issues can be addressed by Apple documentation, see:
- **references/apple_categories.md** - Complete category definitions, keywords, and Apple resource links

**Key categories:**
1. **macOS Updates**: System updates, upgrade issues, compatibility
2. **Login Issues**: Password problems, FileVault, keychain, authentication
3. **Hardware Issues**: Battery, display, keyboard, storage diagnostics
4. **Wi-Fi & Network**: Connectivity problems, network settings
5. **VPN Issues**: Built-in VPN client configuration
6. **Performance**: Slowness, freezing, storage management
7. **Native Apps**: Mail, Safari, Messages, Calendar issues
8. **Bluetooth**: Device pairing, AirDrop, Handoff
9. **Printing**: Printer setup, AirPrint
10. **Permissions**: Privacy settings, app access control

## Script Reference

### analyze_tickets.py

**Purpose:** Parse Excel files and categorize support tickets

**Usage:**
```bash
python scripts/analyze_tickets.py <input.xlsx> [output.json]
```

**Features:**
- Auto-detects file structure (handles multiple header row formats)
- Normalizes column names across vendor formats
- Categorizes tickets using keyword matching
- Generates JSON output with detailed results
- Prints summary to console for immediate feedback

**Dependencies:**
- pandas
- openpyxl (for .xlsx files)

**Portability:** Self-contained script, can be copied and run anywhere with dependencies installed.

### generate_docs.py

**Purpose:** Create documentation in multiple formats from analysis results

**Usage:**
```bash
python scripts/generate_docs.py <analysis.json> [output_directory]
```

**Outputs:**
- Markdown with tables and links
- DOCX with professional formatting
- PDF (requires pandoc or weasyprint)

**Dependencies:**
- python-docx (for Word documents)
- weasyprint or pandoc (for PDF generation)
- markdown (for HTML conversion)

**Portability:** Self-contained script, works independently of skill context.

## Installation Notes

**Required Python packages:**
```bash
pip install pandas openpyxl python-docx weasyprint markdown --break-system-packages
```

**Optional (for better PDF generation):**
```bash
# Install pandoc via system package manager
# Ubuntu/Debian: sudo apt install pandoc
# macOS: brew install pandoc
```

## Claude Code Best Practices

**When working in Claude Code:**

1. **Direct execution** - Scripts have executable permissions and shebangs:
   ```bash
   # Can run directly (no 'python' needed)
   ./scripts/analyze_tickets.py input.xlsx analysis.json
   
   # Or with python explicitly
   python scripts/analyze_tickets.py input.xlsx analysis.json
   ```

2. **Use relative paths** - Scripts work from any directory:
   ```bash
   cd /home/user/projects
   python /path/to/skill/scripts/analyze_tickets.py ./tickets.xlsx ./output.json
   ```

3. **Output to current directory** - Keep results organized:
   ```bash
   mkdir analysis_results
   python scripts/generate_docs.py analysis.json ./analysis_results/
   ```

4. **Chain commands** - Run analysis and documentation in one go:
   ```bash
   python scripts/analyze_tickets.py tickets.xlsx temp.json && \
   python scripts/generate_docs.py temp.json ./reports/ && \
   rm temp.json
   ```

5. **Integrate with MCP** - If Supportify MCP is available, enhance after initial analysis:
   ```python
   # After getting top categories from analysis
   # Use MCP to fetch specific Apple documentation
   searchAppleDocumentation("macOS update troubleshooting")
   fetchAppleDocumentation("/documentation/macos/update-process")
   ```

6. **Error handling** - Scripts provide clear error messages:
   ```
   Error: Could not find description columns in the file
   → Check if file has standard column names or adjust script
   ```

7. **Standalone usage** - Scripts are self-contained and can be copied:
   ```bash
   # Copy scripts to a project directory
   cp -r scripts/analyze_tickets.py ~/my_project/
   cd ~/my_project
   ./analyze_tickets.py data.xlsx results.json
   ```

## Data Privacy & Security

**CRITICAL: This skill does NOT store or persist any customer data.**

- All analysis is performed in-memory and in temporary files
- Output files are only saved to user-specified locations
- No customer information is embedded in the skill
- No data is sent to external services (except Apple documentation lookups via Supportify MCP)
- Scripts are stateless and do not maintain any database or persistent storage

**Files processed:**
- Input Excel files are read but never modified
- Analysis results are saved only to specified output paths
- All file operations are controlled by the user

**To ensure privacy:**
- Delete analysis JSON files after generating documentation
- Store output reports in secure locations
- Do not commit customer data to version control
- Review generated reports before sharing externally

## Best Practices

1. **Always review uncategorized tickets** - These may need manual categorization or indicate new issue types

2. **Update keyword lists** - As new issues emerge, update the keyword dictionaries in `analyze_tickets.py`

3. **Use Supportify MCP** - When available, enhance reports with live Apple documentation lookups

4. **Combine multiple files** - For trend analysis, analyze multiple time periods and compare results

5. **Share results strategically**:
   - Use Markdown for team wikis and GitHub
   - Use DOCX for stakeholder presentations
   - Use PDF for formal reports and archives

6. **Track improvements** - Re-analyze tickets quarterly to measure impact of documentation efforts

## Troubleshooting

**Script can't find description columns:**
- File may have non-standard structure
- Check header rows manually
- May need to adjust `detect_file_structure()` function

**Low confidence categorizations:**
- Ticket descriptions may be too vague
- Review uncategorized tickets manually
- Add domain-specific keywords to improve accuracy

**PDF generation fails:**
- Install pandoc or weasyprint
- Use markdown output as alternative
- Convert markdown to PDF using external tools

**MCP integration issues:**
- Verify Supportify MCP is connected
- Check MCP tool availability with `list-tools`
- Fall back to pre-defined Apple resource links

---

## Complete Workflow: From Excel to Knowledge Base

This skill provides an end-to-end workflow for transforming help desk data into actionable knowledge base articles.

### Overview: The Three-Stage Process

```
Stage 1: Analyze          Stage 2: Generate         Stage 3: Populate & Deploy
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│  Excel File     │      │  KB Templates    │      │  Final KB Articles     │
│  (910 tickets)  │─────>│  (Top 10 issues) │─────>│  (Ready for import)    │
└─────────────────┘      └──────────────────┘      └────────────────────────┘
      │                          │                           │
      │ analyze_tickets.py       │ generate_kb_articles.py   │ Claude Code + MCP
      │                          │                           │
      ↓                          ↓                           ↓
  JSON Analysis            JSON Templates            Markdown/HTML/JSON
```

### Stage 1: Analyze Help Desk Data

**Input**: Excel file with support tickets
**Output**: JSON analysis with categorized tickets

```bash
python scripts/analyze_tickets.py tickets.xlsx analysis.json
```

**What happens:**
- Detects file structure and "Raw data" sheet automatically
- Categorizes each ticket as Apple-addressable or vendor-specific
- Generates frequency analysis of top issues
- Outputs summary statistics

**Example output:**
```
Total Tickets: 910
Apple Addressable: 160 (17.6%)
  wifi_network: 30 tickets
  app_deployment: 28 tickets
  performance: 23 tickets
  ...
```

### Stage 2: Generate KB Article Templates

**Input**: `analysis.json` from Stage 1
**Output**: KB templates ready for MCP population

```bash
python scripts/generate_kb_articles.py analysis.json ./kb_templates/
```

**What happens:**
- Creates template for each top issue category
- Includes actual ticket descriptions as problem statements
- Adds placeholders for MCP content population
- Generates MCP workflow file (`mcp_workflow.json`)

**Output files:**
- `kb_template_{category}.json` - Individual templates
- `all_kb_templates.json` - All templates combined
- `mcp_workflow.json` - MCP automation workflow
- `README.md` - Next steps instructions

### Stage 3: Populate with Apple Documentation (MCP Integration)

**Input**: KB templates from Stage 2
**Output**: Complete KB articles ready for ticketing system import

#### Option A: Automated with Claude Code (Recommended)

Simply ask Claude Code to populate the templates:

```
Use Supportify MCP to populate the KB templates in ~/Desktop/kb_templates/
with Apple documentation and generate final KB articles.
```

**Claude Code will:**
1. Read each KB template
2. Use `searchAppleDocumentation` MCP tool to find relevant articles
3. Use `fetchAppleDocumentation` MCP tool to retrieve content
4. Populate templates with actual troubleshooting steps
5. Generate final KB articles in multiple formats:
   - Markdown (`.md`) - For Confluence, Zendesk, GitHub
   - HTML (`.html`) - For web publishing
   - JSON (`.json`) - For API import to ServiceNow, Jira

#### Option B: Manual MCP Integration

For each category template:

**Step 1: Search Apple Documentation**
```python
# Use searchAppleDocumentation MCP tool
results = searchAppleDocumentation(
    query="wifi network troubleshooting macOS"
)
# Returns: List of relevant Apple support articles
```

**Step 2: Fetch Article Content**
```python
# Use fetchAppleDocumentation MCP tool
content = fetchAppleDocumentation(
    url=results['articles'][0]['url']
)
# Returns: Full article content with troubleshooting steps
```

**Step 3: Populate Template**
```python
# Load template
template = load_template('kb_template_wifi_network.json')

# Replace placeholders with MCP content
template['quick_steps'] = extract_steps(content)
template['detailed_troubleshooting'] = extract_details(content)
template['common_causes'] = extract_causes(content)

# Add source citations
template['sources'] = [article['url'] for article in results['articles']]
```

**Step 4: Generate Final KB Article**
```python
# Export in multiple formats
export_markdown(template, 'wifi_network_kb.md')
export_html(template, 'wifi_network_kb.html')
export_json(template, 'wifi_network_kb.json')
```

---

## KB Article Structure

Each generated KB article includes:

### Frontmatter Metadata
```yaml
title: How to Resolve Wi-Fi Network Issues on macOS
category: wifi_network
tags: [macOS, Apple, Self-Service, WiFi]
source: Apple Official Documentation
frequency: 30 support tickets
created: 2025-10-21
target_audience: End Users and Support Technicians
```

### Content Sections
1. **Problem Description** - Based on actual ticket descriptions
2. **Quick Resolution Steps** - Step-by-step from Apple docs
3. **Detailed Troubleshooting** - In-depth guidance for complex cases
4. **Common Causes** - Known issues and solutions
5. **Enterprise Considerations** - Corporate-specific guidance
6. **Additional Resources** - Links to Apple articles
7. **When to Escalate** - Clear escalation criteria
8. **Success Metrics** - Expected ticket reduction

---

## Import to Ticketing Systems

### ServiceNow

**Format**: JSON
**API**: Knowledge Base API

```bash
# Convert markdown to ServiceNow-compatible JSON
python scripts/export_servicenow.py wifi_network_kb.md

# Import via API
curl -X POST "https://instance.service-now.com/api/now/table/kb_knowledge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ..." \
  -d @wifi_network_kb_servicenow.json
```

**ServiceNow JSON Structure:**
```json
{
  "short_description": "How to Resolve Wi-Fi Network Issues on macOS",
  "text": "<article content>",
  "category": "Desktop Support",
  "kb_category": "Mac Support",
  "tags": "macOS,WiFi,Apple",
  "source": "Apple Official Documentation"
}
```

### Jira/Confluence

**Format**: Markdown or HTML
**API**: Confluence REST API

```bash
# Upload to Confluence
curl -X POST "https://your-domain.atlassian.net/wiki/rest/api/content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ..." \
  -d '{
    "type": "page",
    "title": "How to Resolve Wi-Fi Network Issues on macOS",
    "space": {"key": "IT"},
    "body": {
      "storage": {
        "value": "<html content>",
        "representation": "storage"
      }
    }
  }'
```

### Zendesk

**Format**: Markdown
**API**: Help Center API

```bash
# Create article in Zendesk
curl -X POST "https://your-domain.zendesk.com/api/v2/help_center/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ..." \
  -d '{
    "article": {
      "title": "How to Resolve Wi-Fi Network Issues on macOS",
      "body": "<markdown content>",
      "locale": "en-us",
      "user_segment_id": null,
      "permission_group_id": 1234
    }
  }'
```

### Custom/Manual Import

For systems without APIs:
1. Open the generated markdown file
2. Copy content into your KB system's editor
3. Adjust formatting as needed
4. Add tags and metadata manually
5. Publish to users

---

## Complete Example: End-to-End Workflow

### Real Example with GSK Ticket Data

**Starting Point**: 910 tickets from 6-month period

```bash
# Stage 1: Analyze tickets
python scripts/analyze_tickets.py \
  "GSK_tickets.xlsx" \
  analysis.json

# Output:
# - 160 Apple-addressable issues (17.6%)
# - Top category: WiFi (30 tickets)

# Stage 2: Generate KB templates
python scripts/generate_kb_articles.py \
  analysis.json \
  ./kb_templates/

# Output:
# - 10 KB templates created
# - MCP workflow generated
# - README with next steps

# Stage 3: Populate with MCP (via Claude Code)
# Ask Claude Code:
"Populate the KB templates in ./kb_templates/ using Supportify MCP"

# Claude Code will:
# - Search Apple docs for each category
# - Fetch relevant articles
# - Generate final KB articles

# Stage 4: Import to ServiceNow
python scripts/export_servicenow.py \
  kb_templates/wifi_network_kb_complete.md \
  servicenow_import.json

curl -X POST "https://gsk.service-now.com/api/now/table/kb_knowledge" \
  -H "Content-Type: application/json" \
  -d @servicenow_import.json
```

**Result:**
- 10 new KB articles published to ServiceNow
- Support techs have official Apple guidance
- End users can self-service common issues
- Expected ticket reduction: 15-20% for addressable categories

---

## MCP Workflow Automation

The `mcp_workflow.json` file provides structured instructions for automating MCP integration:

```json
{
  "workflow_name": "Generate KB Articles with Supportify MCP",
  "steps": [
    {
      "step_number": 1,
      "category": "wifi_network",
      "frequency": 30,
      "mcp_actions": [
        {
          "action": "searchAppleDocumentation",
          "query": "wifi network troubleshooting macOS"
        },
        {
          "action": "fetchAppleDocumentation",
          "purpose": "Retrieve detailed content from top articles"
        }
      ],
      "output": "kb_article_wifi_network.md"
    }
  ]
}
```

Claude Code can read this workflow and execute all steps automatically.

---

## Best Practices for KB Article Management

### 1. Keep Articles Updated
- Re-analyze tickets quarterly
- Update KB articles when new macOS versions release
- Refresh Apple documentation links if they change

### 2. Track Article Effectiveness
- Monitor ticket volume for each category after KB publication
- Measure deflection rate (tickets avoided due to self-service)
- Collect feedback from support techs on article usefulness

### 3. Iterate Based on Data
- If tickets continue in a category, enhance the KB article
- Add new troubleshooting steps based on recurring issues
- Use MCP to fetch updated Apple guidance

### 4. Maintain Source Citations
- Always include links to original Apple articles
- Update when Apple deprecates or replaces articles
- Credit Apple as the authoritative source

### 5. Customize for Your Environment
- Add enterprise-specific steps (802.1X, certificates, etc.)
- Include screenshots from your environment
- Document your escalation paths and contacts

---

## Measuring Success

### Key Metrics

**Ticket Deflection Rate:**
```
Deflection Rate = (Tickets Before - Tickets After) / Tickets Before × 100%

Example:
- WiFi tickets before KB: 30 per 6 months
- WiFi tickets after KB: 22 per 6 months
- Deflection rate: (30-22)/30 = 26.7%
```

**Self-Service Adoption:**
- KB article views
- Average time to resolution (should decrease)
- Escalation rate (should decrease)

**Support Tech Efficiency:**
- Time saved per ticket resolved via KB
- Number of tickets closed with KB reference

### Expected Improvements

Based on the GSK ticket analysis (160 Apple-addressable out of 910):

| Metric | Before KB | After KB (Projected) | Improvement |
|--------|-----------|---------------------|-------------|
| Apple-addressable tickets | 160/6mo | 120-130/6mo | 20-25% reduction |
| Average resolution time | Variable | Faster | 30-40% improvement |
| Escalations | Higher | Lower | 15-20% reduction |
| User satisfaction | Baseline | Improved | Self-service available |

---

## Scripts Reference

### analyze_tickets.py
- **Purpose**: Analyze Excel ticket data and categorize issues
- **Input**: Excel file (auto-detects "Raw data" sheet)
- **Output**: JSON analysis with frequency data

### generate_kb_articles.py
- **Purpose**: Create KB templates from analysis
- **Input**: `analysis.json`
- **Output**: KB templates + MCP workflow

### populate_kb_with_mcp.py
- **Purpose**: Generate MCP workflow instructions for Claude Code
- **Input**: `mcp_workflow.json`
- **Output**: Detailed instructions markdown file

### export_servicenow.py (future)
- **Purpose**: Convert markdown KB to ServiceNow JSON format
- **Input**: Markdown KB article
- **Output**: ServiceNow-compatible JSON

### export_confluence.py (future)
- **Purpose**: Convert markdown KB to Confluence HTML
- **Input**: Markdown KB article
- **Output**: Confluence-compatible HTML

---

## FAQ

**Q: Do I need the Supportify MCP to use this skill?**
A: No, but it's recommended. Without MCP, you'll use pre-defined Apple resource links instead of fetching live content.

**Q: Can I customize the KB templates?**
A: Yes! Templates are JSON files you can edit before population.

**Q: What if my ticketing system isn't listed?**
A: Use the markdown output and copy/paste into your system, or create a custom export script.

**Q: How often should I re-analyze tickets?**
A: Quarterly is recommended to identify new trends and update KB articles.

**Q: Can I add my own troubleshooting steps?**
A: Absolutely! Edit the generated KB articles to add enterprise-specific guidance.

**Q: What about non-Apple issues?**
A: The skill identifies vendor-specific issues separately. These need vendor documentation or in-house KB creation.

**Q: How do I know if a KB article is effective?**
A: Track ticket volume for that category before and after publication. A 15-25% reduction is typical.
