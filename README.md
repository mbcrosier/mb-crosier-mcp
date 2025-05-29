# MB's Personal MCP Server

This is a remote MCP server that has been customized for [MB Crosier](https://www.mbcrosier.com). It includes 3 tools:

## Tools
*   `get_bio`: Returns a paragraph biography of MB Crosier.
*   `get_contact_info`: Returns the contact email for MB Crosier.
*   `get_social_links`: Returns JSON with MB Crosier's Linkedin, Github, Instagram, and Twitter/X accounts.

---

## Try out this MCP Server using Cloudflare's AI Playground

1. Go to https://playground.ai.cloudflare.com/
2. Enter this MCP Server's deployed URL (`https://mb-crosier-mcp.mbcrosier.workers.dev/sse`)
3. You can now use MB's MCP server directly from the playground!

## Connect this MCP Server to Claude Desktop

To connect to this MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mb-crosier-mcp.mbcrosier.workers.dev/sse" 
      ]
    }
  }
}
```

Restart Claude and you should see the new tools become available. 