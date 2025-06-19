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
					{ type: "text", text: "MB (\"Mary Boyd\") Crosier is currently a student in Harvard's MS/MBA: Engineering Sciences program. MB writes a Substack newsletter called MCP in Context (https://www.mcpincontext.com) about all things related to the Model Context Protocol. Previously, she worked at marketing and operations roles at Stytch (a Series B developer tools startup focused on authentication APIs), as a management consultant focused on tech due diligences at Bain & Co, and was a strategy intern at Codecademy, focused on curriculum development and community building. Before that, she studied Systems and Information Engineering at UVA, as a  Jefferson Scholar. Outside of work, MB enjoys running, doing crosswords, traveling, and scuba diving. She also loves learning about local history, and has been a volunteer historical tour guide at the University of Virginia, on Boston's Freedom Trail, and at New York's Merchant House Museum. To learn more about MB, visit her personal website at https://www.mbcrosier.com." },
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
					{ type: "text", text: JSON.stringify({ linkedin: "https://linkedin.com/in/maryboydcrosier", github: "https://github.com/mbcrosier", instagram: "https://instagram.com/maryboydc", twitter: "https://x.com/mb_crosier" }, null, 2) },
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
	<p>This MCP server has been customized for <a href="https://www.mbcrosier.com" target="_blank">MB Crosier</a> and exposes the following tools:</p>
			<ul>
				<li><code>get_bio</code>: Returns a paragraph biography of MB Crosier.</li>
				<li><code>get_contact_info</code>: Returns the contact email for MB Crosier (mbcrosier@gmail.com).</li>
				<li><code>get_social_links</code>: Returns JSON with MB Crosier's Linkedin, Github, Instagram, and Twitter accounts.</li>
			</ul>
			<hr />
			<h2>Try out this MCP Server using Cloudflare's AI Playground</h2>
			<ol>
				<li>Go to <a href="https://playground.ai.cloudflare.com/" target="_blank">Cloudflare AI Playground</a></li>
				<li>Enter this MCP Server's deployed URL: <code>https://mb-crosier-mcp.mbcrosier.workers.dev/sse</code></li>
				<li>You can now use MB's MCP server directly from the playground!</li>
			</ol>
			<h2>Connect this MCP Server to Claude Desktop</h2>
			<p>To connect to this MCP server from Claude Desktop, follow <a href="https://modelcontextprotocol.io/quickstart/user" target="_blank">Anthropic's Quickstart</a> and within Claude Desktop go to <b>Settings &gt; Developer &gt; Edit Config</b>. Use this config:</p>
			<pre style="background:#eee;padding:1em;border-radius:5px;overflow-x:auto;"><code>{
			  "mcpServers": {
    "mb-crosier-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mb-crosier-mcp.mbcrosier.workers.dev/sse" 
      ]
    }
  }
}
</code></pre>
			<footer>
				&copy; ${new Date().getFullYear()} MB Crosier &mdash; <a href="https://www.mbcrosier.com" target="_blank">mbcrosier.com</a>
			</footer>
</body>
</html>
`;

// --- CORS helper ---
const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function withCORSHeaders(resp: Response) {
	for (const [k, v] of Object.entries(CORS_HEADERS)) {
		resp.headers.set(k, v);
	}
	return resp;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const isMcpPath = url.pathname === "/sse" || url.pathname === "/sse/message";

		// Helper to always add CORS headers for MCP endpoints
		function corsResponse(resp: Response) {
			if (isMcpPath) {
				for (const [k, v] of Object.entries(CORS_HEADERS)) {
					resp.headers.set(k, v);
				}
			}
			return resp;
		}

		try {
			// IMMEDIATE: Handle CORS preflight (OPTIONS) for /sse and /sse/message
			if (isMcpPath && request.method === "OPTIONS") {
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}

			// Handle requests to the /sse path or /sse/message path for MCP communication
			if (isMcpPath) {
				// Check if the request to /sse is likely from a browser expecting HTML
				if (url.pathname === "/sse" && request.headers.get("Accept")?.includes("text/html")) {
					// Serve the HTML landing page for browsers on /sse
					return corsResponse(new Response(landingPageHTML, { headers: { "Content-Type": "text/html" } }));
				} else {
					// Handle as an MCP request via SSE for clients on /sse or /sse/message
					const resp = await MyMCP.serveSSE("/sse").fetch(request, env, ctx);
					return corsResponse(resp);
				}
			}

			// Return 404 for any other path
			return new Response("Not found", { status: 404 });
		} catch (err: any) {
			// Always return CORS headers on error for MCP endpoints
			if (isMcpPath) {
				return corsResponse(new Response("Internal server error", { status: 500 }));
			}
			return new Response("Internal server error", { status: 500 });
		}
	},
};

