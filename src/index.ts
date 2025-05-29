import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "MB Crosier Personal Server",
		version: "1.0.0",
	});

	async init() {
		// Get Bio tool
		this.server.tool(
			"get_bio",
			"Get a brief bio of MB Crosier.",
			async () => ({
				content: [
					{ type: "text", text: "MB (\"Mary Boyd\") Crosier is currently a student in Harvard's MS/MBA: Engineering Sciences program. MB also writes a Substack newsletter called MCP in Context (https://www.mcpincontext.com) about all things related to the Model Context Protocol. Previously, she worked at marketing and operations roles at Stytch (a Series B developer tools startup), as a management consultant focused on tech due diligences at Bain & Co, and was a strategy intern at Codecademy, focused on curriculum development and community building. Before that, she studied Systems and Information Engineering at UVA, as a  Jefferson Scholar. Outside of work, MB enjoys running, doing crosswords, traveling, and scuba diving. She also loves learning about local history, and has been a volunteer historical tour guide at the University of Virginia, on Boston's Freedom Trail, and at New York's Merchant House Museum. To learn more about MB, visit her personal website at https://www.mbcrosier.com." },
				],
			})
		);

		// Get Contact Info tool
		this.server.tool(
			"get_contact_info",
			"Get the contact email for MB Crosier.",
			async () => ({
				content: [
					{ type: "text", text: "mbcrosier@gmail.com" },
				],
			})
		);

		// Get Social Links tool
		this.server.tool(
			"get_social_links",
			"Get social media links for MB Crosier.",
			async () => ({
				content: [
					{ type: "text", text: JSON.stringify({ linkedin: "https://linkedin.com/in/maryboydcrosier", github: "https://github.com/mbcrosier", instagram: "https://instagram.com/maryboydc" }, null, 2) },
				],
			})
		);
	}
}

// Simple HTML landing page for browsers at /sse
const landingPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MB Crosier's Personal MCP Server</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; margin: 20px; }
        h1, h2 { color: #333; }
        code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>MB Crosier's Personal MCP Server</h1>
    <p>This is a Model Context Protocol (MCP) server hosted on Cloudflare Workers, providing information about MB Crosier.</p>
    <h2>Available Tools:</h2>
    <ul>
        <li><code>get_bio</code>: Returns a paragraph biography of MB Crosier.</li>
        <li><code>get_contact_info</code>: Returns the contact email for MB Crosier (mbcrosier@gmail.com).</li>
        <li><code>get_social_links</code>: Returns JSON with MB Crosier's Linkedin, Github, and Instagram accounts.</li>
    </ul>
    <h2>Connecting Clients:</h2>
    <p>You can connect to this server using MCP-compatible clients like Cloudflare AI Playground, Claude Desktop, or Cursor.</p>
    <h3>Cloudflare AI Playground:</h3>
    <p>Go to <a href="https://playground.ai.cloudflare.com/">https://playground.ai.cloudflare.com/</a> and enter your deployed server URL ending in <code>/sse</code>.</p>
    <h3>Other Clients (Claude Desktop, Cursor):</h3>
    <p>Use the <code>mcp-remote</code> proxy. Configure your client with command <code>npx</code> and arguments <code>mcp-remote</code> and your server URL ending in <code>/sse</code> (or <code>http://localhost:8787/sse</code> for local development).</p>
</body>
</html>
`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/sse") {
			// Check if request is likely from a browser expecting HTML
			if (request.headers.get("Accept")?.includes("text/html")) {
				return new Response(landingPageHTML, { headers: { "Content-Type": "text/html" } });
			} else {
				// Not a browser, handle as an MCP request via SSE
				return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
			}
		}

		// If not /sse, return 404
		return new Response("Not found", { status: 404 });
	},
};

