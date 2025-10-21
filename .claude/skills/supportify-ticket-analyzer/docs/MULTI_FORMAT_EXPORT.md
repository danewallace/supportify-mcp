# Multi-Format KB Article Export Guide

Export KB articles to multiple formats for different distribution channels and use cases.

## Supported Formats

| Format | Extension | Use Case | Tools Required |
|--------|-----------|----------|----------------|
| **Markdown** | `.md` | Source format, Confluence, GitHub | None (native) |
| **HTML** | `.html` | Web publishing, email | markdown library |
| **DOCX** | `.docx` | Microsoft Word, editing, review | python-docx |
| **PDF** | `.pdf` | Distribution, printing, archiving | See PDF section below |
| **ServiceNow JSON** | `.json` | ServiceNow import | export_servicenow.py |

## Installation

```bash
# Install required Python packages
pip install python-docx markdown

# For PDF generation (optional - see PDF section)
# macOS (if using weasyprint):
brew install pango gobject-introspection  # System libraries first
pip install weasyprint

# Alternative: Use pandoc for PDF
brew install pandoc
```

## Quick Start

### Single Article Export

Export one KB article to all formats:

```bash
python scripts/export_kb_all_formats.py \
  wifi_network_kb.md \
  ./exports/
```

**Output:**
```
exports/
├── wifi_network_kb.md                # Markdown
├── wifi_network_kb.html              # HTML
├── wifi_network_kb.docx              # Word
├── wifi_network_kb.pdf               # PDF (if available)
└── wifi_network_kb_servicenow.json   # ServiceNow
```

### Batch Export

Export all KB articles in a directory:

```bash
python scripts/export_kb_all_formats.py \
  --batch ./kb_templates/ \
  ./all_exports/
```

## Format Details

### Markdown (.md)

**Description:** Original source format with frontmatter metadata

**Features:**
- YAML frontmatter with article metadata
- Standard markdown syntax
- Compatible with Confluence, GitHub, Zendesk

**Use for:**
- Version control
- Confluence wiki pages
- Zendesk help center
- GitHub documentation

**Example:**
```markdown
---
title: How to Resolve Wi-Fi Issues
category: wifi_network
frequency: 30 support tickets
---

# How to Resolve Wi-Fi Issues

## Quick Steps
1. Step one
2. Step two
```

### HTML (.html)

**Description:** Full standalone HTML page with CSS styling

**Features:**
- Apple-inspired design (SF Pro font, Apple colors)
- Responsive layout
- Syntax-highlighted code blocks
- Metadata section from frontmatter
- Print-friendly styles

**Use for:**
- Web publishing
- Intranet pages
- Email distribution (embedded)
- Preview/review

**Styling:** Matches Apple Human Interface Guidelines

### DOCX (.docx)

**Description:** Microsoft Word document with formatting

**Features:**
- Professional formatting
- Editable in Word, Google Docs, Pages
- Metadata table at top
- Headings with proper hierarchy
- Styled code blocks
- Lists and tables

**Use for:**
- Manual editing/customization
- Leadership review
- Offline distribution
- Converting to PDF (via Word)
- Adding screenshots

**Editing:** Open in Microsoft Word, Google Docs, or Apple Pages

### PDF (.pdf)

**Description:** Read-only distribution format

**Features:**
- Professional layout
- Preserves formatting
- Print-ready
- Universal compatibility

**Use for:**
- Distribution to users
- Training materials
- Archival purposes
- Printable handouts

#### PDF Generation Options

##### Option 1: WeasyPrint (Linux/Docker)

WeasyPrint requires system libraries that can be challenging on macOS:

```bash
# On Linux
sudo apt-get install python3-cffi python3-brotli \
  libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0

pip install weasyprint
```

**Docker approach for macOS:**
```bash
# Create Dockerfile
docker run --rm -v $(pwd):/data \
  python:3.12-slim bash -c "
  apt-get update && \
  apt-get install -y libpango-1.0-0 libharfbuzz0b && \
  pip install weasyprint markdown && \
  python /data/export_kb_all_formats.py /data/article.md /data/output/
  "
```

##### Option 2: Convert from DOCX (Recommended for macOS)

**Using Microsoft Word:**
1. Open the generated `.docx` file
2. File > Save As > PDF
3. Done!

**Using Pages (macOS):**
```bash
# Command line conversion
/usr/bin/textutil -convert pdf wifi_network_kb.docx
```

**Using LibreOffice:**
```bash
# Install LibreOffice
brew install --cask libreoffice

# Convert to PDF
/Applications/LibreOffice.app/Contents/MacOS/soffice \
  --headless --convert-to pdf wifi_network_kb.docx
```

##### Option 3: Pandoc

```bash
# Install pandoc
brew install pandoc

# Convert markdown to PDF
pandoc wifi_network_kb.md -o wifi_network_kb.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt

# Or convert HTML to PDF
pandoc wifi_network_kb.html -o wifi_network_kb.pdf
```

##### Option 4: HTML to PDF (Browser)

1. Open the `.html` file in a browser
2. Print > Save as PDF
3. Adjust margins/scaling as needed

**Automated with Chrome:**
```bash
# macOS Chrome headless
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu --print-to-pdf=output.pdf \
  file:///path/to/wifi_network_kb.html
```

### ServiceNow JSON (.json)

**Description:** ServiceNow kb_knowledge table import format

**Use for:** Importing to ServiceNow

**See:** [SERVICENOW_IMPORT.md](SERVICENOW_IMPORT.md) for details

## Complete Workflow Example

```bash
# Step 1: Analyze tickets
python scripts/analyze_tickets.py tickets.xlsx analysis.json

# Step 2: Generate KB templates
python scripts/generate_kb_articles.py analysis.json ./kb_templates/

# Step 3: (Optional) Populate with MCP
# Use Supportify MCP to fetch Apple documentation

# Step 4: Export to all formats
python scripts/export_kb_all_formats.py \
  --batch ./kb_templates/ \
  ./final_exports/

# Step 5: Generate PDFs (if needed)
cd final_exports
for docx in *.docx; do
  /usr/bin/textutil -convert pdf "$docx"
done

# Step 6: Distribute
# - Upload HTML to intranet
# - Import JSON to ServiceNow
# - Share DOCX with stakeholders
# - Distribute PDF to end users
```

## File Naming Convention

Exported files follow this pattern:

```
{original_filename}.{extension}

Examples:
wifi_network_kb.md
wifi_network_kb.html
wifi_network_kb.docx
wifi_network_kb.pdf
wifi_network_kb_servicenow.json  # Special suffix for ServiceNow
```

## Customization

### Modify HTML Styling

Edit the CSS in `export_kb_all_formats.py` (line ~65):

```python
# Change colors
h1 {{ color: #1d1d1f; border-bottom: 3px solid #0066cc; }}
# Change to your brand color:
h1 {{ color: #1d1d1f; border-bottom: 3px solid #FF6600; }}
```

### Modify DOCX Styling

Edit `export_docx()` function:

```python
# Change font
font.name = 'Helvetica'
# Change to:
font.name = 'Arial'

# Change heading color
title_run.font.color.rgb = RGBColor(0, 102, 204)
# Change to your brand:
title_run.font.color.rgb = RGBColor(255, 102, 0)
```

### Add Custom Metadata

Edit frontmatter in source markdown:

```yaml
---
title: Article Title
category: network
frequency: 30 tickets
department: IT Support        # Custom field
last_reviewed: 2025-10-21     # Custom field
reviewed_by: John Doe         # Custom field
---
```

Custom fields will appear in metadata table (DOCX) and metadata section (HTML).

## Troubleshooting

### DOCX Export Fails

**Error:** `python-docx not available`

**Solution:**
```bash
pip install python-docx
```

### HTML Missing Formatting

**Error:** Basic HTML without styling

**Solution:**
```bash
pip install markdown
```

### PDF Generation Fails

**See:** PDF Generation Options section above

**Quick fix:** Use DOCX → PDF conversion via Word or Pages

### ServiceNow JSON Export Fails

**Error:** `Cannot import export_servicenow`

**Solution:** Ensure `export_servicenow.py` is in the same directory

### Batch Export Finds No Files

**Error:** `No KB articles found`

**Solution:** Ensure files match pattern `*_kb*.md` or `*KB*.md`

## Integration with Ticketing Systems

### Confluence

**Format:** Markdown or HTML

**Import:**
1. Create new page
2. Edit > Insert > Markup
3. Paste markdown content

Or use Confluence API:
```bash
# Upload HTML
curl -X POST "https://your-domain.atlassian.net/wiki/rest/api/content" \
  -H "Content-Type: application/json" \
  -d @confluence_payload.json
```

### Zendesk

**Format:** Markdown

**Import:**
```bash
# Via API
curl -X POST "https://your-domain.zendesk.com/api/v2/help_center/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "article": {
      "title": "Wi-Fi Troubleshooting",
      "body": "<markdown content>",
      "locale": "en-us"
    }
  }'
```

### SharePoint

**Format:** DOCX or HTML

**Import:**
1. Upload DOCX to document library
2. Or create page and embed HTML

### Internal Wiki/Intranet

**Format:** HTML

**Steps:**
1. Upload `.html` file to web server
2. Or embed HTML in CMS
3. Ensure CSS is inline (already is)

## Best Practices

### 1. Keep Source Markdown Clean

- Use frontmatter for all metadata
- Follow consistent heading hierarchy
- Test markdown in GitHub/Confluence first

### 2. Review DOCX Before Distribution

- Open in Word and check formatting
- Add screenshots if needed
- Adjust styles as needed
- Export to PDF from Word

### 3. Version Control

```bash
# Track in git
git add kb_templates/*.md
git commit -m "KB: Updated WiFi troubleshooting article"

# Export when ready to publish
python scripts/export_kb_all_formats.py --batch ./kb_templates/ ./publish/
```

### 4. Automate with CI/CD

```yaml
# GitHub Actions example
- name: Export KB Articles
  run: |
    pip install python-docx markdown
    python scripts/export_kb_all_formats.py --batch ./kb_templates/ ./exports/

- name: Upload Artifacts
  uses: actions/upload-artifact@v2
  with:
    name: kb-articles
    path: exports/
```

### 5. Test Distribution

Before mass distribution:
1. Export one article
2. Test in target system (ServiceNow, Confluence, etc.)
3. Review formatting
4. Adjust export script if needed
5. Then batch export all articles

## Performance

**Single article export:** ~1-2 seconds
**Batch export (10 articles):** ~10-15 seconds
**PDF generation adds:** ~2-3 seconds per article

**Optimization:**
- Use batch mode for multiple articles
- Skip PDF if not needed (saves time)
- Use multi-threading for large batches (future enhancement)

## Support

**For issues with:**
- HTML/DOCX export: Check Python dependencies
- PDF export: See PDF Generation Options
- ServiceNow JSON: See SERVICENOW_IMPORT.md
- Custom formatting: Edit CSS/DOCX styles in script

## Future Enhancements

Planned improvements:
- [ ] Multi-threaded batch export
- [ ] Direct Confluence API integration
- [ ] Custom branding/themes
- [ ] Export to additional formats (epub, txt)
- [ ] Template customization via config file
