---
title: MCP
aka: Model Context Protocol
tagline: MCP is just JSON-RPC over stdio with extra steps
primitives:
  - JSON-RPC
  - stdio
category: protocols
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

MCP is a "universal, open protocol" that enables AI models to securely connect to external data sources and tools. It's been called "USB-C for AI" — a universal plug that lets any model talk to any tool.

## What it actually is

MCP is JSON-RPC 2.0 transported over stdio (or SSE for remote servers). That's it.

A "tool" is a JSON schema describing function parameters. The LLM decides to call it, the host serializes the call as a JSON-RPC request, sends it to a subprocess over stdin, and reads the response from stdout.

### The protocol in pseudocode

```
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

If you've built a CLI tool that accepts JSON on stdin and writes JSON to stdout, you've built half of MCP. If you've used JSON-RPC (like the Language Server Protocol), you've built the other half.

LSP is actually a closer ancestor than most people realize — MCP's transport layer is nearly identical.
