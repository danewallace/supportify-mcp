# Setting Up Supportify MCP with Claude Desktop on Mac

## Quick Setup (5 minutes)

### 1. Start the MCP Server

```bash
cd /Users/danewallace/Git/supportify-mcp
npm run dev
```

Keep this terminal running. You should see:
```
Ready on http://localhost:51345
```

### 2. Configure Claude Desktop

Open Claude's config file:

```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "supportify": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:51345/mcp"
      ]
    }
  }
}
```

**Note**: If you already have other MCP servers, add `supportify` alongside them within the `mcpServers` object.

### 3. Restart Claude

1. Completely quit Claude Desktop (⌘Q)
2. Reopen Claude from Applications

### 4. Test the Connection

Start a new conversation in Claude and try these queries:

#### Test 1: Basic Connection
```
Can you access the Supportify MCP server? What resources are available?
```

You should see Claude mention `support://` resources.

#### Test 2: Fetch Content
```
Using the Supportify MCP, can you get information about declarative device management from the Apple deployment guide?
```

Claude should use the `fetchAppleSupportGuide` tool.

#### Test 3: Search
```
What does Apple say about the Secure Enclave?
```

Claude should fetch and explain content from the security guide.

---

## 🔍 Troubleshooting

### Claude Can't Connect to MCP

**Check server is running:**
```bash
# In your terminal, you should see the wrangler dev output
# Test manually:
curl http://localhost:51345/guide/security/welcome
```

**Check the config file path:**
```bash
# Make sure the file exists
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

# View contents
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Check Claude's logs:**
```bash
# Open Claude logs
tail -f ~/Library/Logs/Claude/mcp*.log
```

### Server Not Starting

```bash
cd /Users/danewallace/Git/supportify-mcp

# Reinstall dependencies
npm install

# Try dev mode again
npm run dev
```

### Port Already in Use

If port 51345 is taken:

```bash
# Kill any process using the port
lsof -ti:51345 | xargs kill -9

# Or edit wrangler.jsonc to use a different port
# Then update your Claude config to match
```

---

## 📖 Example Queries for Claude

Once connected, try these queries:

### Deployment Guide Queries

**Declarative Device Management:**
```
What is declarative device management according to Apple's deployment guide?
```

**Device Enrollment:**
```
What are the different device enrollment methods for Apple devices?
```

**MDM Configuration:**
```
How does mobile device management work with Apple devices?
```

### Security Guide Queries

**Secure Enclave:**
```
Explain Apple's Secure Enclave technology in detail.
```

**FileVault:**
```
How does FileVault encryption work on macOS?
```

**Face ID Security:**
```
What security features does Face ID use?
```

### Advanced Queries

**Comparison:**
```
Compare User Enrollment vs Device Enrollment for Apple devices.
```

**Implementation:**
```
What steps do I need to take to implement Automated Device Enrollment?
```

**Security Architecture:**
```
Explain Apple's hardware security architecture starting with the Secure Enclave.
```

---

## 🎯 Understanding How It Works

When you ask Claude about Apple deployment or security topics:

1. **Claude recognizes** you're asking about Apple documentation
2. **Claude uses the MCP tool** `fetchAppleSupportGuide` 
3. **Supportify fetches** the relevant page from Apple Support
4. **Content is parsed** and returned as clean Markdown
5. **Claude reads and explains** the official Apple documentation

You're getting **official, up-to-date Apple documentation** through Claude!

---

## 🔧 Advanced: Direct HTTP Access

You can also use the HTTP API directly:

```bash
# Search for topics
curl "http://localhost:51345/guide/deployment/search?q=enrollment" | jq

# Get specific content
curl http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff

# Browse all topics
curl http://localhost:51345/guide/deployment/toc | jq '.topics[0:10]'
```

---

## 📝 Config File Template

Save this as your complete Claude config:

```json
{
  "mcpServers": {
    "supportify": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:51345/mcp"
      ],
      "env": {}
    }
  }
}
```

---

## ✅ Verification Checklist

- [ ] Server running (`npm run dev` shows "Ready on...")
- [ ] Config file created at `~/Library/Application Support/Claude/claude_desktop_config.json`
- [ ] JSON syntax is valid (no trailing commas, proper brackets)
- [ ] Claude Desktop restarted completely
- [ ] Test query returns results about Apple documentation

---

## 🚀 Next Steps

Once connected:

1. **Explore topics**: Ask Claude to search the deployment guide
2. **Deep dives**: Request detailed explanations of security features
3. **Compare options**: Ask Claude to compare different enrollment methods
4. **Implementation help**: Get step-by-step guidance using official docs

---

## 💡 Pro Tips

1. **Be specific**: "What does Apple's deployment guide say about DDM?" works better than "Tell me about DDM"
2. **Request sources**: Ask Claude to cite which Apple guide page it's using
3. **Multi-topic queries**: "Compare what the security guide says about Secure Enclave vs what the deployment guide says about device enrollment"
4. **Keep server running**: The MCP server must be running for Claude to access it

---

Need help? Check the main [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md) for more details.

