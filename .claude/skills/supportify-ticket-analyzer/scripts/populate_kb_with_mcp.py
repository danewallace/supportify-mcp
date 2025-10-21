#!/usr/bin/env python3
"""
MCP KB Population Script
This script is designed to be called by Claude Code to orchestrate MCP tool usage
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def load_workflow(workflow_file):
    """Load the MCP workflow file"""
    with open(workflow_file, 'r') as f:
        return json.load(f)

def load_template(template_file):
    """Load a KB template"""
    with open(template_file, 'r') as f:
        return json.load(f)

def create_mcp_instructions(workflow_file, output_file='mcp_instructions.md'):
    """
    Create detailed instructions for Claude Code to execute MCP workflow
    """
    workflow = load_workflow(workflow_file)

    instructions = f"""# Supportify MCP Workflow Instructions

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Workflow**: {workflow['workflow_name']}

## Overview

{workflow['description']}

This workflow will process {len(workflow['steps'])} categories and generate KB articles using Supportify MCP.

---

## Execution Steps

"""

    for step in workflow['steps']:
        category = step['category']
        category_display = category.replace('_', ' ').title()

        instructions += f"""
### Step {step['step_number']}: {category_display} ({step['frequency']} tickets)

**Template File**: `kb_template_{category}.json`

#### MCP Actions:

1. **Search Apple Documentation**
   ```
   Tool: searchAppleDocumentation
   Query: "{step['mcp_actions'][0]['query']}"
   Expected: 5-10 relevant Apple support articles
   ```

2. **Fetch Documentation Content**
   ```
   Tool: fetchAppleDocumentation
   Input: Top 3 URLs from search results
   Expected: Detailed article content with troubleshooting steps
   ```

#### Content Population:

From the fetched Apple documentation, extract:
- **Quick Resolution Steps**: Clear step-by-step instructions
- **Detailed Troubleshooting**: In-depth guidance from Apple articles
- **Common Causes**: Known issues and solutions
- **Additional Resources**: Links to related Apple support articles

#### Output:
- **File**: `{step['output']}`
- **Format**: Markdown with frontmatter metadata
- **Include**:
  - Original Apple source citations
  - Links to all referenced articles
  - Ticket frequency data from template

---
"""

    instructions += f"""
## Template Population Instructions

For each category, follow this pattern:

### 1. Load Template
```python
template = load_template('kb_template_{{category}}.json')
```

### 2. Execute MCP Search
Use the `searchAppleDocumentation` MCP tool:
- Query from template's `mcp_query` fields
- Review search results
- Select top 3-5 most relevant articles

### 3. Fetch Article Content
Use the `fetchAppleDocumentation` MCP tool:
- Fetch each selected article
- Extract troubleshooting steps
- Note common solutions

### 4. Populate Template
Replace placeholders with actual content:
- `[TO BE POPULATED FROM MCP: ...]` → Real content from Apple docs
- Keep source citations
- Maintain formatting

### 5. Generate Final KB Article
Create final markdown file with:

```markdown
---
title: {{template.title}}
category: {{template.category}}
tags: {{template.tags}}
source: Apple Official Documentation
frequency: {{template.frequency}} tickets
created: {{template.created_date}}
---

# {{template.title}}

## Problem Description
{{template.problem_statement}}

## Quick Resolution Steps
{{content from Apple docs}}

## Detailed Troubleshooting
{{content from Apple docs}}

## Common Causes
{{content from Apple docs}}

## Additional Resources
{{links to Apple articles}}

## When to Escalate
{{template.escalation_guidance}}

---
**Sources**:
- [Apple Support Article](URL)
- [Apple Developer Documentation](URL)

**Based on**: {step['frequency']} support tickets
```

---

## Automation Script

To automate this process, Claude Code can execute:

```python
import json
from pathlib import Path

# Load workflow
workflow = load_workflow('mcp_workflow.json')

# For each step
for step in workflow['steps']:
    category = step['category']

    # 1. Search Apple docs (MCP tool call)
    search_results = searchAppleDocumentation(
        query=step['mcp_actions'][0]['query']
    )

    # 2. Fetch top articles (MCP tool call)
    articles = []
    for url in search_results['top_urls'][:3]:
        content = fetchAppleDocumentation(url=url)
        articles.append(content)

    # 3. Load template
    template = load_template(f'kb_template_{{category}}.json')

    # 4. Populate template with Apple content
    kb_article = populate_template(template, articles)

    # 5. Export final KB article
    export_kb_article(kb_article, f'{{category}}_kb.md')
```

---

## Output Files

After completion, you will have:
- `{{category}}_kb.md` - Final KB article in markdown
- `{{category}}_kb.html` - HTML version for web publishing
- `{{category}}_kb.json` - Structured data for API import

## Import to Ticketing Systems

### ServiceNow
```bash
# Use ServiceNow KB Import API
POST /api/now/table/kb_knowledge
```

### Jira/Confluence
```bash
# Use Confluence REST API
POST /wiki/rest/api/content
```

### Zendesk
```bash
# Use Zendesk Articles API
POST /api/v2/help_center/articles
```

---

## Success Criteria

✓ All templates populated with real Apple documentation
✓ Source citations included
✓ Escalation paths defined
✓ Formatted for ticketing system import
✓ Ticket frequency data preserved

"""

    return instructions

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python populate_kb_with_mcp.py <mcp_workflow.json>")
        print("\nGenerates detailed instructions for Claude Code to execute MCP workflow")
        sys.exit(1)

    workflow_file = sys.argv[1]
    output_file = 'MCP_WORKFLOW_INSTRUCTIONS.md'

    try:
        instructions = create_mcp_instructions(workflow_file, output_file)

        # Write instructions file
        with open(output_file, 'w') as f:
            f.write(instructions)

        print(f"✓ Created MCP workflow instructions: {output_file}")
        print(f"\nNext: Use Claude Code to execute this workflow and populate KB articles")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
