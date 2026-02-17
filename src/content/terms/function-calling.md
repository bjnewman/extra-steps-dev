---
title: Function Calling
aka: Tool Use
tagline: Function calling is just JSON serialization and function dispatch with extra steps
primitives:
  - JSON serialization
  - function dispatch
category: patterns
audience: app-dev
publishedAt: 2026-02-16
draft: false
---

## What they say

Function calling lets AI models "interact with external systems," "execute real-world actions," and "access up-to-date information." It's presented as a breakthrough capability where the model can "decide" to call your functions.

## What it actually is

You send the LLM a list of function signatures (as JSON Schema). The LLM responds with a JSON object containing the function name and arguments. You deserialize the JSON, look up the function in a dispatch table, call it, and send the result back.

### The pattern in pseudocode

```typescript
// 1. Define tools as JSON Schema
const tools = [{
  name: "get_weather",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string" }
    }
  }
}];

// 2. LLM returns structured JSON
const response = await llm.chat({ messages, tools });
// response.tool_calls = [{ name: "get_weather", arguments: '{"city":"Chicago"}' }]

// 3. You dispatch it — this is just a lookup table
const dispatch: Record<string, Function> = {
  get_weather: (args) => weatherApi.get(args.city),
};

// 4. Deserialize and call
const call = response.tool_calls[0];
const args = JSON.parse(call.arguments);
const result = await dispatch[call.name](args);
```

### The "extra steps"

1. **Schema definition** — describing your functions as JSON Schema (interface definition)
2. **Structured output** — the LLM formats its "decision" as valid JSON (constrained decoding)
3. **Parallel tool calls** — the LLM can request multiple calls at once (batch dispatch)
4. **Forced tool use** — making the LLM always call a specific function (removing the conditional)

### What you already know

If you've built an RPC system, a CLI with subcommands, or a REST API with a router, you understand function calling. The JSON Schema is the interface definition. The dispatch table is the router. The only difference is that the "caller" is an LLM that figured out the arguments from natural language.
