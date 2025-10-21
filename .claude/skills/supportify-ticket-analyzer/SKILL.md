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
