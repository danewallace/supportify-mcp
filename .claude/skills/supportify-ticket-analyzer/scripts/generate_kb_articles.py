#!/usr/bin/env python3
"""
Knowledge Base Article Generator for Supportify
Integrates with Supportify MCP to generate KB articles from ticket analysis
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from collections import Counter

def load_analysis(analysis_file):
    """Load the JSON analysis results"""
    with open(analysis_file, 'r') as f:
        return json.load(f)

def get_category_details(category_name, tickets):
    """Extract details about a specific category"""
    category_tickets = [t for t in tickets if t['category'] == category_name]

    # Get unique descriptions/patterns
    descriptions = [t['short_description'] for t in category_tickets if t.get('short_description')]

    # Calculate frequency
    frequency = len(category_tickets)

    return {
        'category': category_name,
        'frequency': frequency,
        'tickets': category_tickets,
        'sample_descriptions': descriptions[:10]  # First 10 for analysis
    }

def generate_kb_template(category_name, category_details, apple_docs_placeholder=None):
    """
    Generate a KB article template for a category
    This template can be populated with actual Apple documentation via MCP
    """

    category_display = category_name.replace('_', ' ').title()

    kb_article = {
        'title': f'How to Resolve: {category_display} Issues on macOS',
        'category': category_name,
        'frequency': category_details['frequency'],
        'tags': ['macOS', 'Apple', 'Self-Service', category_name],
        'target_audience': 'End Users and Support Technicians',
        'created_date': datetime.now().strftime('%Y-%m-%d'),
        'source_type': 'Apple Official Documentation',
        'template': generate_article_content(category_name, category_details, apple_docs_placeholder)
    }

    return kb_article

def generate_article_content(category_name, category_details, apple_docs=None):
    """Generate the article content structure"""

    category_display = category_name.replace('_', ' ').title()

    content = {
        'summary': f'This article provides guidance for resolving {category_display} issues on macOS devices.',
        'problem_statement': generate_problem_statement(category_details),
        'solution_sections': [
            {
                'title': 'Quick Resolution Steps',
                'placeholder': '[TO BE POPULATED FROM MCP: Step-by-step instructions from Apple docs]',
                'mcp_query': f'{category_name} troubleshooting steps'
            },
            {
                'title': 'Detailed Troubleshooting',
                'placeholder': '[TO BE POPULATED FROM MCP: Detailed guidance from Apple support articles]',
                'mcp_query': f'{category_name} detailed troubleshooting'
            },
            {
                'title': 'Common Causes',
                'placeholder': '[TO BE POPULATED FROM MCP: Common causes from Apple documentation]',
                'mcp_query': f'{category_name} common issues'
            }
        ],
        'additional_resources': {
            'placeholder': '[TO BE POPULATED FROM MCP: Related Apple support articles]',
            'mcp_query': f'{category_name} related documentation'
        },
        'when_to_escalate': generate_escalation_guidance(category_name)
    }

    if apple_docs:
        content['apple_documentation'] = apple_docs

    return content

def generate_problem_statement(category_details):
    """Generate problem statement based on actual tickets"""
    sample_issues = category_details['sample_descriptions'][:5]

    problem_statement = f"Based on {category_details['frequency']} recent support tickets, users commonly experience:\n\n"

    for i, issue in enumerate(sample_issues, 1):
        if issue:
            problem_statement += f"{i}. {issue}\n"

    return problem_statement

def generate_escalation_guidance(category_name):
    """Generate escalation guidance for each category"""
    escalation_map = {
        'wifi_network': 'Escalate if issue persists after resetting network settings and hardware is confirmed working.',
        'app_deployment': 'Escalate if package installation fails with permissions errors or requires MDM intervention.',
        'performance': 'Escalate if performance issues persist after freeing storage and checking for malware.',
        'printer': 'Escalate if printer hardware is confirmed working but macOS cannot detect it.',
        'macos_update': 'Escalate if update fails repeatedly or device is incompatible with required OS version.',
        'hardware_issue': 'Escalate to Apple Support or authorized service provider for hardware repairs.',
        'login_issue': 'Escalate if user cannot reset password or FileVault recovery key is lost.',
        'mdm_management': 'Escalate to MDM administrators if enrollment fails or profiles conflict.',
        'permissions': 'Escalate if granting permissions in System Settings does not resolve the issue.',
        'device_lifecycle': 'Escalate if Migration Assistant fails or Activation Lock cannot be removed.',
        'bluetooth': 'Escalate if Bluetooth devices work on other systems but not on this Mac.',
        'native_apps': 'Escalate if reinstalling the app or resetting preferences does not help.',
        'enterprise_auth': 'Escalate to directory services team if domain join or authentication fails.',
        'enterprise_network': 'Escalate to network team if certificate installation or 802.1X setup fails.',
        'file_sharing': 'Escalate to file server administrators if SMB connection issues persist.',
        'software_update_mgmt': 'Escalate to MDM team if update policies are not applying correctly.',
        'vpn_issue': 'Escalate if built-in VPN configuration is correct but connection fails.'
    }

    return escalation_map.get(category_name, 'Escalate if basic troubleshooting steps do not resolve the issue.')

def generate_mcp_integration_instructions(analysis_file, output_dir):
    """
    Generate instructions for using Supportify MCP to populate KB articles
    This creates a workflow file that Claude Code can execute
    """

    analysis = load_analysis(analysis_file)
    apple_tickets = analysis['apple_addressable_tickets']
    top_categories = analysis['summary']['top_apple_categories']

    workflow = {
        'workflow_name': 'Generate KB Articles with Supportify MCP',
        'description': 'Use Supportify MCP to fetch Apple documentation and populate KB article templates',
        'steps': []
    }

    for category, count in list(top_categories.items())[:10]:  # Top 10 categories
        category_details = get_category_details(category, apple_tickets)

        step = {
            'step_number': len(workflow['steps']) + 1,
            'category': category,
            'frequency': count,
            'mcp_actions': [
                {
                    'action': 'searchAppleDocumentation',
                    'query': f'{category.replace("_", " ")} troubleshooting macOS',
                    'purpose': 'Find relevant Apple support articles'
                },
                {
                    'action': 'fetchAppleDocumentation',
                    'purpose': 'Retrieve detailed content from top 3 articles',
                    'note': 'Use URLs from search results'
                }
            ],
            'output': f'kb_article_{category}.md'
        }

        workflow['steps'].append(step)

    return workflow

def export_kb_templates(analysis_file, output_dir):
    """Export KB article templates ready for MCP population"""

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    analysis = load_analysis(analysis_file)
    apple_tickets = analysis['apple_addressable_tickets']
    top_categories = analysis['summary']['top_apple_categories']

    kb_articles = []

    print(f"Generating KB article templates for {len(top_categories)} categories...\n")

    for category, count in top_categories.items():
        category_details = get_category_details(category, apple_tickets)
        kb_article = generate_kb_template(category, category_details)
        kb_articles.append(kb_article)

        # Save individual template
        template_file = output_path / f'kb_template_{category}.json'
        with open(template_file, 'w') as f:
            json.dump(kb_article, f, indent=2)

        print(f"✓ Created template: {category} ({count} tickets)")

    # Save workflow instructions
    workflow = generate_mcp_integration_instructions(analysis_file, output_dir)
    workflow_file = output_path / 'mcp_workflow.json'
    with open(workflow_file, 'w') as f:
        json.dump(workflow, f, indent=2)

    print(f"\n✓ Created MCP workflow: {workflow_file}")

    # Save all templates in one file
    all_templates_file = output_path / 'all_kb_templates.json'
    with open(all_templates_file, 'w') as f:
        json.dump(kb_articles, f, indent=2)

    print(f"✓ Created combined templates: {all_templates_file}")

    # Create README for next steps
    readme_content = f"""# Knowledge Base Article Templates

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Analysis File: {analysis_file}

## Templates Created

{len(kb_articles)} KB article templates have been generated based on ticket analysis.

## Next Steps: Populate with Apple Documentation

To populate these templates with actual Apple documentation, use Supportify MCP:

### Option 1: Use Claude Code (Recommended)

1. Open this directory in Claude Code
2. Run the MCP workflow:
   ```
   Process the MCP workflow in mcp_workflow.json and populate the KB templates
   ```

3. Claude Code will:
   - Search Apple documentation for each category
   - Fetch relevant content from Apple support articles
   - Populate the templates with actual guidance
   - Generate final KB articles in markdown and HTML formats

### Option 2: Manual MCP Integration

For each category template:

1. **Search for documentation**:
   ```
   Use searchAppleDocumentation tool with query from template
   ```

2. **Fetch detailed content**:
   ```
   Use fetchAppleDocumentation tool with URLs from search results
   ```

3. **Populate template**:
   - Replace placeholders with content from Apple docs
   - Add source citations
   - Format for your ticketing system

## Template Structure

Each KB template includes:
- **Title**: User-friendly article title
- **Problem Statement**: Based on actual ticket descriptions
- **Solution Sections**: Placeholders for MCP content
- **Escalation Guidance**: When to escalate to next level
- **Metadata**: Tags, category, frequency data

## Ticketing System Import

After populating templates with MCP:
- **ServiceNow**: Use JSON format for KB import
- **Jira/Confluence**: Convert to markdown or HTML
- **Zendesk**: Use markdown format
- **Custom Systems**: Use JSON templates as data source

## Files in This Directory

- `kb_template_*.json`: Individual category templates
- `all_kb_templates.json`: All templates in one file
- `mcp_workflow.json`: MCP automation workflow
- `README.md`: This file

"""

    readme_file = output_path / 'README.md'
    with open(readme_file, 'w') as f:
        f.write(readme_content)

    print(f"✓ Created README: {readme_file}")

    return {
        'templates_created': len(kb_articles),
        'output_directory': str(output_path),
        'workflow_file': str(workflow_file),
        'readme_file': str(readme_file)
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate_kb_articles.py <analysis.json> [output_dir]")
        print("\nThis script creates KB article templates from ticket analysis.")
        print("Templates can then be populated with Apple documentation using Supportify MCP.")
        sys.exit(1)

    analysis_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else './kb_templates'

    try:
        result = export_kb_templates(analysis_file, output_dir)

        print("\n" + "="*80)
        print("KB TEMPLATE GENERATION COMPLETE")
        print("="*80)
        print(f"\nTemplates created: {result['templates_created']}")
        print(f"Output directory: {result['output_directory']}")
        print(f"\nNext: Use Supportify MCP to populate templates with Apple documentation")
        print(f"See {result['readme_file']} for instructions")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
