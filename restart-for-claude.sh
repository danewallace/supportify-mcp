#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║  Restarting Supportify MCP for Claude     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Checking for running wrangler processes...${NC}"
WRANGLER_PIDS=$(lsof -ti:51345 2>/dev/null)

if [ -n "$WRANGLER_PIDS" ]; then
    echo -e "${YELLOW}Found wrangler running on port 51345${NC}"
    echo "Kill it? (y/n)"
    read -r KILL_IT
    
    if [[ "$KILL_IT" =~ ^[Yy]$ ]]; then
        echo "$WRANGLER_PIDS" | xargs kill -9
        echo -e "${GREEN}✓${NC} Stopped wrangler"
        sleep 2
    else
        echo "Skipping..."
    fi
else
    echo -e "${GREEN}✓${NC} No wrangler processes found"
fi

echo ""
echo -e "${BLUE}Step 2: Starting server with new search tool...${NC}"
echo ""
echo "The server will start in this terminal window."
echo "You'll see:"
echo "  • 'Ready on http://localhost:51345'"
echo "  • Keep this window open"
echo ""
echo -e "${YELLOW}Press Ctrl+C when you're ready to stop the server${NC}"
echo ""
sleep 2

echo -e "${GREEN}Starting now...${NC}"
echo ""

cd "$(dirname "$0")"
npm run dev

