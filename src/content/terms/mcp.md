---
title: MCP
aka: Model Context Protocol
tagline: MCP is just JSON-RPC over stdio with extra steps
primitives:
  - JSON-RPC
  - stdio
category: protocols
origin: vendor
audience: app-dev
publishedAt: 2026-02-16
snippet:
  prose: "MCP is JSON-RPC 2.0 over stdio. A tool call is a JSON-RPC request sent to a subprocess on stdin; the result comes back on stdout. Same pattern as LSP."
  lang: "json"
  code: |
    // Client → Server (stdin)
    {"jsonrpc":"2.0","method":"tools/call","params":{"name":"read_file","arguments":{"path":"/foo"}},"id":1}

    // Server → Client (stdout)
    {"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"file contents..."}]},"id":1}
draft: false
---

## What they say

MCP is a "universal, open protocol" that enables AI models to securely connect to external data sources and tools.[^1] It's been called "USB-C for AI" — a universal plug that lets any model talk to any tool.

## What it actually is

MCP is JSON-RPC 2.0[^2] transported over stdio (or SSE for remote servers). That's it.

A "tool" is a JSON schema describing function parameters. The LLM decides to call it, the host serializes the call as a JSON-RPC request, sends it to a subprocess over stdin, and reads the response from stdout.

### The protocol in pseudocode

```json
// Client → Server (over stdin)
{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "read_file", "arguments": {"path": "/foo"}}, "id": 1}

// Server → Client (over stdout)
{"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "file contents..."}]}, "id": 1}
```

### The "extra steps"

1. **Capability negotiation** — client and server exchange supported features at startup (standard handshake pattern)
2. **Resource discovery** — server advertises available tools via a `tools/list` method (service registry pattern)
3. **Schema validation** — tool parameters are defined as JSON Schema (input validation)
4. **Lifecycle management** — initialize/shutdown semantics (standard session management)

### What you already know

If you've called a REST API and read the JSON response, you understand 90% of MCP. The difference is that instead of HTTP, the messages go over stdin/stdout to a subprocess — and instead of you deciding what to call, the LLM decides.

```bash
# REST API: you decide to call it
curl https://api.example.com/weather?city=NYC

# MCP server: LLM decides to call it, message goes over stdin
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_weather","arguments":{"city":"NYC"}},"id":1}' | node mcp-server.js
```

Same data, different pipe.[^3]

[^1]: [Model Context Protocol announcement](https://www.anthropic.com/news/model-context-protocol) — Anthropic, November 2024. The blog post framing; read the spec first.
[^2]: [JSON-RPC — Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC) — the underlying wire protocol. The `method`, `params`, and `id` fields in every MCP message come directly from this standard.
[^3]: [Standard streams — Wikipedia](https://en.wikipedia.org/wiki/Standard_streams) — stdin/stdout as an IPC mechanism predates the web. MCP's local transport is just two processes communicating over pipes, the same way Unix tools have always talked to each other.
