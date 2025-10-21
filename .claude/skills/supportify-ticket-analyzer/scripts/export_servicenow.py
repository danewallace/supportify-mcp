#!/usr/bin/env python3
"""
ServiceNow KB Export Script
Converts markdown KB articles to ServiceNow-compatible JSON format
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime

try:
    import markdown
    MARKDOWN_AVAILABLE = True
except ImportError:
    MARKDOWN_AVAILABLE = False
    print("Warning: markdown module not available. Install with: pip install markdown")
    print("Falling back to basic conversion...")

def parse_frontmatter(content):
    """Extract YAML frontmatter from markdown"""
    frontmatter = {}

    # Check for frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            yaml_content = parts[1].strip()
            body = parts[2].strip()

            # Parse simple YAML (key: value format)
            for line in yaml_content.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()

                    # Handle arrays [item1, item2, ...]
                    if value.startswith('[') and value.endswith(']'):
                        value = [v.strip() for v in value[1:-1].split(',')]

                    frontmatter[key] = value

            return frontmatter, body

    return {}, content

def markdown_to_html(markdown_text):
    """Convert markdown to HTML"""
    if MARKDOWN_AVAILABLE:
        return markdown.markdown(
            markdown_text,
            extensions=['extra', 'codehilite', 'tables', 'toc']
        )
    else:
        # Basic fallback conversion
        html = markdown_text

        # Headers
        html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)

        # Bold and italic
        html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
        html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)

        # Lists
        html = re.sub(r'^- (.*?)$', r'<li>\1</li>', html, flags=re.MULTILINE)
        html = re.sub(r'^(\d+)\. (.*?)$', r'<li>\2</li>', html, flags=re.MULTILINE)

        # Paragraphs
        html = re.sub(r'\n\n', r'</p><p>', html)
        html = f'<p>{html}</p>'

        # Code blocks
        html = re.sub(r'```(.*?)```', r'<pre><code>\1</code></pre>', html, flags=re.DOTALL)
        html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)

        return html

def create_servicenow_kb_json(markdown_file, category_map=None, author='IT Support'):
    """
    Convert markdown KB article to ServiceNow JSON format

    ServiceNow kb_knowledge table structure:
    - short_description: Article title
    - text: Article content (HTML)
    - kb_category: Category sys_id or name
    - category: Additional categorization
    - article_type: Type of article (e.g., 'text', 'how_to', 'troubleshooting')
    - workflow_state: Publication state ('published', 'draft', etc.)
    - author: Author name or sys_id
    - source: Where the content came from
    - valid_to: Expiration date (optional)
    """

    # Read markdown file
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse frontmatter and body
    frontmatter, body = parse_frontmatter(content)

    # Convert markdown to HTML
    html_content = markdown_to_html(body)

    # Extract metadata
    title = frontmatter.get('title', 'Untitled Article')
    category = frontmatter.get('category', 'general')
    tags = frontmatter.get('tags', [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',')]
    source = frontmatter.get('source', 'Apple Official Documentation')
    frequency = frontmatter.get('frequency', 0)

    # Map category to ServiceNow category if mapping provided
    kb_category = category
    if category_map and category in category_map:
        kb_category = category_map[category]

    # Create ServiceNow KB record
    servicenow_record = {
        # Required fields
        "short_description": title,
        "text": html_content,

        # Categorization
        "kb_category": kb_category,
        "category": "Mac Support",

        # Article metadata
        "article_type": "troubleshooting",
        "workflow_state": "published",
        "author": author,
        "source": source,

        # Additional fields
        "meta": tags if isinstance(tags, str) else ','.join(tags),
        "topic": "macOS",

        # Custom fields (if configured in your ServiceNow instance)
        "u_ticket_frequency": str(frequency),
        "u_platform": "macOS",
        "u_source_type": "Apple Documentation",

        # Dates
        "published": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "valid_to": "",  # No expiration

        # Visibility
        "can_read_user_criteria": "",  # Empty = all users can read
        "cannot_read_user_criteria": "",
    }

    return servicenow_record

def export_single_article(markdown_file, output_file, category_map=None, author='IT Support'):
    """Export a single KB article to ServiceNow JSON"""

    kb_record = create_servicenow_kb_json(markdown_file, category_map, author)

    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(kb_record, f, indent=2, ensure_ascii=False)

    return kb_record

def export_batch_articles(kb_directory, output_file, category_map=None, author='IT Support'):
    """Export multiple KB articles to ServiceNow JSON array"""

    kb_dir = Path(kb_directory)
    kb_files = list(kb_dir.glob('*_kb*.md'))

    if not kb_files:
        print(f"No KB articles found in {kb_directory}")
        return []

    kb_records = []

    for kb_file in kb_files:
        try:
            record = create_servicenow_kb_json(kb_file, category_map, author)
            kb_records.append(record)
            print(f"✓ Processed: {kb_file.name}")
        except Exception as e:
            print(f"✗ Error processing {kb_file.name}: {e}")

    # Write all records to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(kb_records, f, indent=2, ensure_ascii=False)

    return kb_records

def create_import_script(json_file, servicenow_instance, output_script='import_to_servicenow.sh'):
    """
    Create a shell script for importing KB articles to ServiceNow via API
    """

    script_content = f"""#!/bin/bash
# ServiceNow KB Article Import Script
# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# Configuration
SERVICENOW_INSTANCE="{servicenow_instance}"
SERVICENOW_USER="${{SERVICENOW_USER:-your_username}}"
SERVICENOW_PASSWORD="${{SERVICENOW_PASSWORD:-your_password}}"
KB_JSON_FILE="{json_file}"

# Colors for output
GREEN='\\033[0;32m'
RED='\\033[0;31m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo "================================================"
echo "ServiceNow KB Article Import"
echo "================================================"
echo "Instance: $SERVICENOW_INSTANCE"
echo "JSON File: $KB_JSON_FILE"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "${{RED}}Error: jq is not installed. Install with: brew install jq${{NC}}"
    exit 1
fi

# Check if JSON file exists
if [ ! -f "$KB_JSON_FILE" ]; then
    echo "${{RED}}Error: JSON file not found: $KB_JSON_FILE${{NC}}"
    exit 1
fi

# Determine if JSON is array or single object
if jq -e 'type == "array"' "$KB_JSON_FILE" > /dev/null 2>&1; then
    echo "Detected batch import (multiple articles)"
    ARTICLE_COUNT=$(jq 'length' "$KB_JSON_FILE")
    echo "Articles to import: $ARTICLE_COUNT"
    echo ""

    # Import each article
    for i in $(seq 0 $((ARTICLE_COUNT - 1))); do
        ARTICLE=$(jq ".[$i]" "$KB_JSON_FILE")
        TITLE=$(echo "$ARTICLE" | jq -r '.short_description')

        echo "[$((i+1))/$ARTICLE_COUNT] Importing: $TITLE"

        RESPONSE=$(curl -s -w "\\n%{{http_code}}" -X POST \\
            "https://${{SERVICENOW_INSTANCE}}/api/now/table/kb_knowledge" \\
            -H "Content-Type: application/json" \\
            -H "Accept: application/json" \\
            -u "${{SERVICENOW_USER}}:${{SERVICENOW_PASSWORD}}" \\
            -d "$ARTICLE")

        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | head -n-1)

        if [ "$HTTP_CODE" -eq 201 ]; then
            SYS_ID=$(echo "$BODY" | jq -r '.result.sys_id')
            KB_NUMBER=$(echo "$BODY" | jq -r '.result.number')
            echo "  ${{GREEN}}✓ Success! KB Article: $KB_NUMBER (sys_id: $SYS_ID)${{NC}}"
        else
            echo "  ${{RED}}✗ Failed! HTTP $HTTP_CODE${{NC}}"
            echo "  Response: $BODY"
        fi
        echo ""
    done
else
    echo "Detected single article import"
    TITLE=$(jq -r '.short_description' "$KB_JSON_FILE")
    echo "Article: $TITLE"
    echo ""

    echo "Importing to ServiceNow..."
    RESPONSE=$(curl -s -w "\\n%{{http_code}}" -X POST \\
        "https://${{SERVICENOW_INSTANCE}}/api/now/table/kb_knowledge" \\
        -H "Content-Type: application/json" \\
        -H "Accept: application/json" \\
        -u "${{SERVICENOW_USER}}:${{SERVICENOW_PASSWORD}}" \\
        -d @"$KB_JSON_FILE")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" -eq 201 ]; then
        SYS_ID=$(echo "$BODY" | jq -r '.result.sys_id')
        KB_NUMBER=$(echo "$BODY" | jq -r '.result.number')
        echo "${{GREEN}}✓ Success! KB Article: $KB_NUMBER (sys_id: $SYS_ID)${{NC}}"
    else
        echo "${{RED}}✗ Failed! HTTP $HTTP_CODE${{NC}}"
        echo "Response: $BODY"
    fi
fi

echo ""
echo "================================================"
echo "Import Complete"
echo "================================================"
"""

    with open(output_script, 'w') as f:
        f.write(script_content)

    # Make script executable
    import os
    os.chmod(output_script, 0o755)

    return output_script

def print_usage():
    """Print usage instructions"""
    print("""
ServiceNow KB Export Tool
=========================

Usage:
    # Export single article
    python export_servicenow.py article.md output.json

    # Export batch of articles from directory
    python export_servicenow.py --batch /path/to/kb_articles/ output.json

    # Export and create import script
    python export_servicenow.py article.md output.json --instance your-instance.service-now.com

Options:
    --batch              Export all KB articles in a directory
    --instance URL       Create import script for ServiceNow instance
    --author NAME        Set author name (default: 'IT Support')
    --category-map FILE  JSON file mapping categories to ServiceNow categories

Example:
    # Export single article with import script
    python export_servicenow.py wifi_network_kb.md wifi_kb.json \\
        --instance mycompany.service-now.com \\
        --author "Mac Support Team"

    # Export batch
    python export_servicenow.py --batch ./kb_templates/ all_kb_articles.json \\
        --instance mycompany.service-now.com

ServiceNow Import:
    1. Run this script to create JSON file
    2. Use generated import script: ./import_to_servicenow.sh
    3. Or manually upload via ServiceNow UI: Knowledge > Articles > Import
""")

if __name__ == '__main__':
    if len(sys.argv) < 2 or '--help' in sys.argv or '-h' in sys.argv:
        print_usage()
        sys.exit(0)

    # Parse arguments
    batch_mode = '--batch' in sys.argv
    author = 'IT Support'
    servicenow_instance = None
    category_map = None

    # Extract options
    args = [arg for arg in sys.argv[1:] if not arg.startswith('--')]

    for i, arg in enumerate(sys.argv):
        if arg == '--author' and i + 1 < len(sys.argv):
            author = sys.argv[i + 1]
        elif arg == '--instance' and i + 1 < len(sys.argv):
            servicenow_instance = sys.argv[i + 1]
        elif arg == '--category-map' and i + 1 < len(sys.argv):
            with open(sys.argv[i + 1], 'r') as f:
                category_map = json.load(f)

    try:
        if batch_mode:
            # Batch export
            if len(args) < 2:
                print("Error: Batch mode requires: --batch <directory> <output.json>")
                sys.exit(1)

            kb_directory = args[0]
            output_file = args[1]

            print(f"Exporting KB articles from: {kb_directory}")
            print(f"Output file: {output_file}")
            print()

            records = export_batch_articles(kb_directory, output_file, category_map, author)

            print(f"\n✓ Exported {len(records)} articles to {output_file}")

        else:
            # Single file export
            if len(args) < 2:
                print("Error: Single mode requires: <input.md> <output.json>")
                sys.exit(1)

            input_file = args[0]
            output_file = args[1]

            print(f"Exporting: {input_file}")
            print(f"Output: {output_file}")
            print()

            record = export_single_article(input_file, output_file, category_map, author)

            print(f"✓ Exported: {record['short_description']}")

        # Create import script if instance provided
        if servicenow_instance:
            script_file = create_import_script(output_file, servicenow_instance)
            print(f"\n✓ Created import script: {script_file}")
            print(f"\nTo import to ServiceNow:")
            print(f"  1. Set credentials: export SERVICENOW_USER=your_username SERVICENOW_PASSWORD=your_password")
            print(f"  2. Run: ./{script_file}")
        else:
            print(f"\nTo create import script, add: --instance your-instance.service-now.com")

        print("\nServiceNow JSON export complete!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
