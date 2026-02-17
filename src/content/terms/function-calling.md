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
snippet:
  prose: "The LLM outputs JSON describing which function to call and with what arguments. You parse it and call the function. The API wraps this in structured types, but that's the whole thing."
  lang: "typescript"
  code: |
    // LLM returns: { name: "get_weather", arguments: { location: "NYC" } }
    const response = await llm.chat(messages, { tools });

    if (response.tool_calls) {
      for (const call of response.tool_calls) {
        const fn = tools[call.name];          // look up the function
        const result = await fn(call.arguments); // call it
        messages.push(toolResult(call.id, result));
      }
    }
draft: false
---

## What they say

Function calling lets AI models "interact with external systems," "execute real-world actions," and "access up-to-date information." It's presented as a breakthrough capability where the model can "decide" to call your functions.

## What it actually is

You send the LLM a list of function signatures as JSON Schema.[^1] The LLM responds with a JSON object containing the function name and arguments. You deserialize the JSON, look up the function in a dispatch table, call it, and send the result back.

### The pattern in pseudocode

```typescript
// 1. Define tools as JSON Schema
const tools = [{
  name: "get_weather",
  parameters: {
    type: "object",
    properties: { city: { type: "string" } }
  }
}];

// 2. LLM returns structured JSON
const response = await llm.chat({ messages, tools });
// response.tool_calls = [{ name: "get_weather", arguments: '{"city":"Chicago"}' }]

// 3. Dispatch table — just a lookup
const dispatch: Record<string, Function> = {
  get_weather: (args) => weatherApi.get(args.city),
};

// 4. Deserialize and call
const call = response.tool_calls[0];
const result = await dispatch[call.name](JSON.parse(call.arguments));
```

### The "extra steps"

1. **Schema definition** — describing your functions as JSON Schema (interface definition)
2. **Structured output** — the LLM formats its "decision" as valid JSON (constrained decoding)[^2]
3. **Parallel tool calls** — the LLM can request multiple calls at once (batch dispatch)
4. **Forced tool use** — making the LLM always call a specific function (removing the conditional)

### What you already know

If you've parsed a webhook payload and called a different function based on `event.type`, you understand function calling. The only difference is the thing sending the payload is an LLM that decided which function to invoke from reading natural language.

```typescript
// webhook handler you've written before
if (event.type === 'payment.succeeded') await handlePayment(event.data);
if (event.type === 'user.created')      await sendWelcomeEmail(event.data);

// function calling — same shape, different sender
if (call.name === 'get_weather')  result = await getWeather(call.arguments);
if (call.name === 'send_email')   result = await sendEmail(call.arguments);
```

The LLM is just a new kind of caller.[^3]

[^1]: [JSON Schema — Wikipedia](https://en.wikipedia.org/wiki/JSON#Schema_and_metadata) — what you're actually writing when you define tool parameters. Understanding `type`, `properties`, and `required` covers 90% of real tool definitions. Both [OpenAI](https://platform.openai.com/docs/guides/function-calling) and [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) use this as their tool description format.
[^2]: [Function (computer programming) — Wikipedia](https://en.wikipedia.org/wiki/Function_(computer_programming)) — the dispatch table is literally just an object where keys are function names and values are function references. "Dynamic dispatch" is the CS term for what the LLM triggers.
[^3]: OpenAI introduced function calling as a named feature in [June 2023](https://platform.openai.com/docs/guides/function-calling). The `tools` array in the request is the interface definition; `tool_calls` in the response is the dispatch signal. Anthropic's [tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) uses the same concept with different field names.
