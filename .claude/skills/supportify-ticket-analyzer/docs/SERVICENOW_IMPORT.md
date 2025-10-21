# ServiceNow KB Article Import Guide

This guide explains how to export KB articles from the ticket analyzer and import them into ServiceNow.

## Overview

The workflow is:
```
Markdown KB Article → ServiceNow JSON → Import to ServiceNow → Published KB Article
```

## Prerequisites

**Required:**
- Python 3.x with `markdown` module: `pip install markdown`
- ServiceNow instance with KB (kb_knowledge) table access
- ServiceNow user credentials with `kb_admin` or `kb_contributor` role

**Optional:**
- `jq` command-line tool for JSON parsing (for import script)
- `curl` for API imports

## Step 1: Export KB Article to ServiceNow JSON

### Single Article Export

```bash
python scripts/export_servicenow.py \
  wifi_network_kb.md \
  wifi_network_servicenow.json \
  --instance your-instance.service-now.com \
  --author "Mac Support Team"
```

**Output:**
- `wifi_network_servicenow.json` - ServiceNow-compatible JSON
- `import_to_servicenow.sh` - Automated import script

### Batch Export (Multiple Articles)

```bash
python scripts/export_servicenow.py \
  --batch ./kb_templates/ \
  all_kb_articles_servicenow.json \
  --instance your-instance.service-now.com \
  --author "Mac Support Team"
```

**Output:**
- `all_kb_articles_servicenow.json` - Array of all KB articles
- `import_to_servicenow.sh` - Batch import script

## Step 2: Import to ServiceNow

You have three options for importing:

### Option A: Automated Import Script (Recommended)

The export script creates a ready-to-use import script:

```bash
# Set your ServiceNow credentials
export SERVICENOW_USER="your_username"
export SERVICENOW_PASSWORD="your_password"

# Run the generated import script
./import_to_servicenow.sh
```

**What it does:**
- Automatically detects single vs. batch import
- Imports articles via ServiceNow REST API
- Shows progress and results for each article
- Reports sys_id and KB number for imported articles

### Option B: Manual API Import

Use `curl` to import directly:

#### Single Article:
```bash
curl -X POST "https://your-instance.service-now.com/api/now/table/kb_knowledge" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -u "username:password" \
  -d @wifi_network_servicenow.json
```

#### Batch Import (using jq):
```bash
# For each article in the array
jq -c '.[]' all_kb_articles_servicenow.json | while read article; do
  curl -X POST "https://your-instance.service-now.com/api/now/table/kb_knowledge" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -u "username:password" \
    -d "$article"
done
```

### Option C: ServiceNow UI Import

1. Log in to your ServiceNow instance
2. Navigate to **Knowledge > Administration > Knowledge Bases**
3. Select your knowledge base
4. Go to **Articles** > **Import**
5. Upload the JSON file
6. Map fields if prompted (should auto-map)
7. Review and confirm import

## ServiceNow JSON Structure

The export script creates JSON with these fields mapped to ServiceNow's `kb_knowledge` table:

```json
{
  "short_description": "Article title",
  "text": "Full article content in HTML",
  "kb_category": "Category identifier",
  "category": "Mac Support",
  "article_type": "troubleshooting",
  "workflow_state": "published",
  "author": "Author name",
  "source": "Apple Official Documentation",
  "meta": "comma,separated,tags",
  "topic": "macOS",
  "u_ticket_frequency": "30 support tickets",
  "u_platform": "macOS",
  "u_source_type": "Apple Documentation",
  "published": "2025-10-21 12:00:00",
  "valid_to": "",
  "can_read_user_criteria": "",
  "cannot_read_user_criteria": ""
}
```

**Field Mappings:**

| Source (Markdown Frontmatter) | ServiceNow Field | Description |
|-------------------------------|------------------|-------------|
| `title` | `short_description` | Article title |
| Article body | `text` | HTML-converted content |
| `category` | `kb_category` | Category/topic |
| `source` | `source` | Content source |
| `tags` | `meta` | Article tags |
| `frequency` | `u_ticket_frequency` | How many tickets this addresses |

## Custom Fields

The export includes custom fields (prefixed with `u_`) that you may need to create in your ServiceNow instance:

- `u_ticket_frequency` - Number of support tickets this article addresses
- `u_platform` - Operating system platform (macOS)
- `u_source_type` - Type of documentation source

**To create custom fields in ServiceNow:**
1. Navigate to **System Definition > Tables**
2. Search for `kb_knowledge`
3. Go to **Columns** tab
4. Click **New**
5. Add fields:
   - Column label: `Ticket Frequency`
   - Column name: `u_ticket_frequency`
   - Type: `String`
   - Max length: `100`

Repeat for other custom fields.

## Category Mapping

If your ServiceNow instance uses different category names, create a category mapping file:

**category_map.json:**
```json
{
  "wifi_network": "Network Issues",
  "app_deployment": "Software Installation",
  "performance": "Performance & Optimization",
  "printer": "Printing",
  "macos_update": "System Updates",
  "hardware_issue": "Hardware Support",
  "login_issue": "Authentication",
  "mdm_management": "Device Management"
}
```

**Use with export:**
```bash
python scripts/export_servicenow.py \
  wifi_network_kb.md \
  output.json \
  --category-map category_map.json
```

## Workflow States

Articles are exported with `workflow_state: "published"` by default.

ServiceNow workflow states:
- `draft` - Not visible to end users
- `review` - Under review
- `published` - Live and visible
- `retired` - Archived

To export as draft instead:
1. Edit the exported JSON
2. Change `"workflow_state": "published"` to `"workflow_state": "draft"`
3. Import to ServiceNow
4. Publish via ServiceNow UI after review

## Permissions

Articles are exported with no read restrictions (`can_read_user_criteria: ""`), meaning all users can view them.

**To restrict access:**
1. Import articles as usual
2. In ServiceNow, navigate to the imported article
3. Set **Can Read** criteria:
   - Specific user groups
   - Departments
   - Roles

## Troubleshooting

### Import Script Fails with "401 Unauthorized"

**Cause:** Invalid credentials or insufficient permissions

**Solution:**
```bash
# Verify credentials work
curl -u "username:password" \
  "https://your-instance.service-now.com/api/now/table/sys_user?sysparm_limit=1"

# Verify user has KB roles
# In ServiceNow: User Administration > Users > [your user] > Roles
# Should have: kb_admin or kb_contributor
```

### Import Fails with "403 Forbidden"

**Cause:** User doesn't have permission to create KB articles

**Solution:** Request `kb_contributor` or `kb_admin` role from ServiceNow admin

### HTML Content Doesn't Display Properly

**Cause:** ServiceNow sanitizes HTML

**Solution:**
- Use ServiceNow-safe HTML tags
- Avoid JavaScript or embedded scripts
- Test with simple HTML first
- Use ServiceNow's rich text editor to refine formatting

### Custom Fields Don't Appear

**Cause:** Custom fields (`u_*`) don't exist in your instance

**Solution:**
1. Either create the custom fields (see Custom Fields section above)
2. Or remove custom fields from JSON before import:
```bash
# Remove custom fields
jq 'del(.u_ticket_frequency, .u_platform, .u_source_type)' \
  wifi_network_servicenow.json > cleaned.json
```

### Category Not Found

**Cause:** `kb_category` value doesn't match ServiceNow categories

**Solution:**
1. Create category mapping file (see Category Mapping section)
2. Or edit JSON to use existing ServiceNow category names
3. Or create new categories in ServiceNow to match exported names

## Verifying Import

After import, verify in ServiceNow:

1. Navigate to **Knowledge > Articles > All**
2. Search for your article by title
3. Check:
   - ✓ Article displays correctly
   - ✓ HTML formatting is preserved
   - ✓ Categories are assigned
   - ✓ Tags are populated
   - ✓ Workflow state is "Published"
   - ✓ Source attribution is present

## Best Practices

### 1. Test Import on Non-Production First

```bash
# Export for testing
python scripts/export_servicenow.py article.md test.json \
  --instance test-instance.service-now.com

# Import to test instance
./import_to_servicenow.sh

# Verify in test
# Then repeat for production
```

### 2. Batch Import in Groups

For large numbers of articles, import in batches of 10-20:

```bash
# Split JSON array into chunks
jq -s '.[] | .[]' all_kb_articles.json | split -l 10

# Import each chunk separately
```

### 3. Maintain Source Attribution

Always keep source citations:
- Preserves Apple's attribution
- Helps users find official docs
- Demonstrates authoritative sources

### 4. Use Consistent Authorship

Set a consistent author for all Mac-related KB articles:

```bash
--author "Mac Support Team"
```

This helps users identify Mac-specific content.

### 5. Review Before Publishing

Consider exporting as "draft" first:
1. Import with `workflow_state: "draft"`
2. Review formatting in ServiceNow
3. Make any necessary edits
4. Publish via ServiceNow UI

## Complete Example

**Full workflow from ticket analysis to ServiceNow:**

```bash
# Step 1: Analyze tickets
python scripts/analyze_tickets.py tickets.xlsx analysis.json

# Step 2: Generate KB templates
python scripts/generate_kb_articles.py analysis.json ./kb_templates/

# Step 3: (Populate with MCP - future step)
# For now, we have wifi_network_kb_complete.md as example

# Step 4: Export to ServiceNow JSON
python scripts/export_servicenow.py \
  kb_templates/wifi_network_kb_complete.md \
  wifi_kb_servicenow.json \
  --instance gsk.service-now.com \
  --author "Mac Support Team"

# Step 5: Import to ServiceNow
export SERVICENOW_USER="admin"
export SERVICENOW_PASSWORD="password"
./import_to_servicenow.sh

# Step 6: Verify in ServiceNow
# Navigate to Knowledge > Articles > All
# Search for "Wi-Fi Network Issues"
```

## API Response

Successful import returns:

```json
{
  "result": {
    "sys_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "number": "KB0001234",
    "short_description": "How to Resolve Wi-Fi Network Issues on macOS",
    "workflow_state": "published",
    "author": {
      "link": "https://instance.service-now.com/api/now/table/sys_user/...",
      "value": "user_sys_id"
    }
  }
}
```

Save the `sys_id` and `number` for future reference!

## Updating Articles

To update an existing article:

```bash
# Use PUT instead of POST with the article's sys_id
curl -X PUT "https://instance.service-now.com/api/now/table/kb_knowledge/{sys_id}" \
  -H "Content-Type: application/json" \
  -u "username:password" \
  -d @updated_article.json
```

## Next Steps

After importing to ServiceNow:

1. **Promote articles** to end users via:
   - Service portal
   - Email announcements
   - Help desk training

2. **Track metrics:**
   - KB article views
   - Ticket deflection rate
   - User feedback/ratings

3. **Iterate:**
   - Re-analyze tickets quarterly
   - Update KB articles based on new issues
   - Retire outdated articles

## Support

**For issues with:**
- **Export script**: Check script logs and Python dependencies
- **ServiceNow API**: Check ServiceNow instance logs and user permissions
- **Article formatting**: Edit HTML in ServiceNow UI after import
- **Custom fields**: Contact ServiceNow admin to create fields

## References

- [ServiceNow KB API Documentation](https://docs.servicenow.com/bundle/latest/page/integrate/inbound-rest/concept/c_TableAPI.html)
- [ServiceNow Knowledge Management](https://docs.servicenow.com/bundle/latest/page/product/knowledge-management/concept/c_KnowledgeManagement.html)
- [ServiceNow REST API Explorer](https://developer.servicenow.com/dev.do#!/reference/api/latest/rest/)
