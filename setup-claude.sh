#!/bin/bash

# Setup helper for Claude Desktop + Supportify MCP on Mac

echo "╔════════════════════════════════════════════╗"
echo "║  Supportify MCP - Claude Desktop Setup     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
CONFIG_DIR="$HOME/Library/Application Support/Claude"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}1. Checking if MCP server is running...${NC}"
if curl -s http://localhost:51345/ > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Server is running on http://localhost:51345"
else
    echo -e "   ${YELLOW}!${NC} Server is not running"
    echo ""
    echo "   Start it with: npm run dev"
    echo "   (Keep that terminal window open)"
    echo ""
    exit 1
fi

# Create config directory if it doesn't exist
echo ""
echo -e "${BLUE}2. Checking Claude configuration directory...${NC}"
if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "   ${YELLOW}!${NC} Creating directory: $CONFIG_DIR"
    mkdir -p "$CONFIG_DIR"
fi
echo -e "   ${GREEN}✓${NC} Directory exists"

# Check if config file exists
echo ""
echo -e "${BLUE}3. Checking Claude configuration file...${NC}"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "   ${GREEN}✓${NC} Config file exists"
    echo ""
    echo "   Current configuration:"
    cat "$CONFIG_FILE" | head -20
    echo ""
    echo -e "${YELLOW}   Do you want to add Supportify to existing config? (y/n)${NC}"
    read -r ADD_TO_EXISTING
    
    if [[ "$ADD_TO_EXISTING" =~ ^[Yy]$ ]]; then
        # Backup existing config
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
        echo -e "   ${GREEN}✓${NC} Backed up existing config to $CONFIG_FILE.backup"
        echo ""
        echo -e "${YELLOW}   Please manually add this to your mcpServers:${NC}"
        echo ""
        echo '    "supportify": {'
        echo '      "command": "npx",'
        echo '      "args": ['
        echo '        "-y",'
        echo '        "mcp-remote",'
        echo '        "http://localhost:51345/mcp"'
        echo '      ]'
        echo '    }'
        echo ""
        echo "   Opening config file in default editor..."
        open "$CONFIG_FILE"
        exit 0
    fi
else
    echo -e "   ${YELLOW}!${NC} Config file doesn't exist, creating new one..."
fi

# Create new config file
echo ""
echo -e "${BLUE}4. Creating Claude configuration...${NC}"
cat > "$CONFIG_FILE" << 'EOF'
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
EOF

echo -e "   ${GREEN}✓${NC} Configuration created"
echo ""
echo "   Configuration saved to:"
echo "   $CONFIG_FILE"

# Show the config
echo ""
echo -e "${BLUE}5. Configuration contents:${NC}"
cat "$CONFIG_FILE"

# Test the connection
echo ""
echo -e "${BLUE}6. Testing MCP endpoint...${NC}"
if curl -s http://localhost:51345/mcp -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"ping"}' > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} MCP endpoint responding"
else
    echo -e "   ${YELLOW}!${NC} MCP endpoint test inconclusive (this is normal)"
fi

# Instructions
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  Next Steps                                ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Setup complete!${NC} Now:"
echo ""
echo "1. Restart Claude Desktop:"
echo "   • Quit Claude completely (⌘Q)"
echo "   • Reopen Claude from Applications"
echo ""
echo "2. Test in Claude with these queries:"
echo "   • 'What is declarative device management?'"
echo "   • 'Explain Apple's Secure Enclave'"
echo "   • 'What are device enrollment options?'"
echo ""
echo "3. Claude should use the Supportify MCP to fetch"
echo "   official Apple documentation."
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   • Full guide: cat SETUP-CLAUDE.md"
echo "   • Quick start: cat QUICKSTART.md"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo "   • Check logs: tail -f ~/Library/Logs/Claude/mcp*.log"
echo "   • Test server: curl http://localhost:51345/"
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  Happy querying! 🚀                        ║"
echo "╚════════════════════════════════════════════╝"

