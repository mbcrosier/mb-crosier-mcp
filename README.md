# Building a Remote MCP Server on Cloudflare (Without Auth)

This example allows you to deploy a remote MCP server that doesn't require authentication on Cloudflare Workers. This version is customized to provide information about MB Crosier.

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`. This server includes the following tools:

*   `get_bio`: Returns a paragraph biography of MB Crosier.
*   `get_contact_info`: Returns the contact email for MB Crosier.
*   `get_social_links`: Returns JSON with MB Crosier's Linkedin, Github, and Instagram accounts.

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (e.g., `remote-mcp-server-authless.<your-account>.workers.dev/mcp`)
3. You can now use your MCP tools (get_bio, get_contact_info, get_social_links) directly from the playground!

## Connect Clients to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

### Claude Desktop

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "mbcrosier-server": { // You can name your server anything you like
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/mcp"  // or your deployed Cloudflare Worker URL ending in /mcp
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 

### Cursor

To connect your MCP server to Cursor, go to Settings > AI > MCP. Click "Add MCP Server" and enter the name (e.g., "mbcrosier-server") and the command and arguments as shown in the Claude Desktop example above (using either localhost for local development or your deployed Cloudflare Worker URL).
