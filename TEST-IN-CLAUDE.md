# Testing Supportify MCP in Claude Desktop

## ⚠️ Important: Full Restart Required

After adding the search tool, you need a **complete restart** of both the server and Claude.

## 🔄 Complete Restart Process

### Option 1: Manual Restart

1. **Stop the server:**
   ```bash
   # In the terminal running npm run dev:
   # Press Ctrl+C
   ```

2. **Start fresh:**
   ```bash
   cd /Users/danewallace/Git/supportify-mcp
   npm run dev
   ```

3. **Verify server is ready:**
   - Look for: `Ready on http://localhost:51345`

4. **Restart Claude Desktop:**
   - Quit Claude (⌘Q) - **must fully quit**
   - Wait 5 seconds
   - Reopen Claude

### Option 2: Use Restart Script

```bash
# This will guide you through the restart
./restart-for-claude.sh
```

---

## ✅ Test Queries After Restart

Once everything is restarted, try these **exact queries** in Claude:

### Test 1: Verify Tools Are Available

```
What MCP tools do you have available from Supportify?
```

**Expected:** Claude should mention:
- `searchAppleSupportGuide` (NEW!)
- `fetchAppleSupportGuide`

### Test 2: Search and Fetch (This Should Work Now!)

```
Use the Supportify MCP to search the deployment guide for 
"declarative device management", then fetch the first result.
```

**Expected workflow:**
1. Claude uses `searchAppleSupportGuide` → finds results
2. Claude uses `fetchAppleSupportGuide` with correct slug → gets full content
3. You see the complete DDM documentation!

### Test 3: Direct Topic Request

```
Tell me about Apple's Secure Enclave using the official 
security guide from Supportify.
```

**Expected:** Claude searches, finds "Secure Enclave", fetches the 21KB article, and explains it.

---

## 🐛 If It's Still Not Working

### Check 1: Server Has Search Tool

Test the search endpoint directly:

```bash
curl "http://localhost:51345/guide/deployment/search?q=declarative" | jq
```

**Should return:** JSON with search results

### Check 2: Claude Can Connect to Server

In Claude, ask:
```
Can you connect to the Supportify MCP server?
```

**Should see:** Claude mentions the Supportify server is available

### Check 3: View Claude's MCP Logs

```bash
# See what Claude is doing with MCP
tail -f ~/Library/Logs/Claude/mcp*.log
```

Look for:
- Connection to `http://localhost:51345/mcp`
- Tool calls to `searchAppleSupportGuide`
- Tool calls to `fetchAppleSupportGuide`

---

## 📝 Example of Working Session

**You:** "Search the Apple deployment guide for declarative device management"

**Claude:** 
```
I'll search for that information.

🔧 Using supportify searchAppleSupportGuide...

Found 20 results for "declarative device management":

1. Intro to declarative device management (slug: depb1bab77f8)
2. Use declarative device management (slug: depc30268577)
...

Now let me fetch the first result with the full content.

🔧 Using supportify fetchAppleSupportGuide...

Based on Apple's official deployment guide, declarative device 
management is an update to the existing protocol...
[Full explanation with official content]
```

---

## 🎯 What Changed

**Before (broken):**
- Only `fetchAppleSupportGuide` tool
- Claude had to guess page slugs
- Often got wrong pages

**After (fixed):**
- Added `searchAppleSupportGuide` tool
- Claude can search for topics first
- Always gets the right page!

---

## 💡 Pro Tips

1. **Always restart both server AND Claude** after code changes
2. **Wait a few seconds** between quitting and reopening Claude
3. **Use search-first queries**: "Search for X, then tell me about it"
4. **Be specific**: "deployment guide" or "security guide" helps Claude choose the right guide

---

## 🆘 Still Having Issues?

1. **Kill all node processes:**
   ```bash
   killall node
   npm run dev
   ```

2. **Check Claude config:**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
   Should show: `http://localhost:51345/mcp`

3. **Try a different port:**
   Edit `wrangler.jsonc` and change port, then update Claude config to match

4. **Check if something else is using port 51345:**
   ```bash
   lsof -i :51345
   ```

---

Need more help? Check:
- [SETUP-CLAUDE.md](SETUP-CLAUDE.md) - Full setup guide
- [QUICKSTART.md](QUICKSTART.md) - API reference
- [README.md](README.md) - Complete documentation

