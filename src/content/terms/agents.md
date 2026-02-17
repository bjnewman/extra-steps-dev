---
title: Agents
tagline: Agents are just while loops with an LLM as the transition function
primitives:
  - while loop
  - LLM call
  - tool dispatch
category: patterns
audience: app-dev
publishedAt: 2026-02-16
draft: false
---

## What they say

AI agents are "autonomous entities that can reason, plan, and take action to achieve complex goals." They "break down tasks, use tools, and adapt their approach based on intermediate results."

## What it actually is

An agent is a loop. On each iteration, you send the conversation history to an LLM, the LLM either responds with text (done) or requests a tool call (keep going), you execute the tool and append the result, and you loop again.

### The pattern in pseudocode

```python
messages = [system_prompt, user_message]

while True:
    response = llm.chat(messages)

    if response.has_tool_calls():
        for call in response.tool_calls:
            result = dispatch(call.name, call.arguments)
            messages.append(tool_result(call.id, result))
    else:
        print(response.text)
        break
```

That's the entire architecture. Everything else is optimization.

### The "extra steps"

1. **"Planning"** — prompting the LLM to output a plan before acting (chain of thought)
2. **"Memory"** — appending to the message array, or summarizing older messages when it gets too long (array management)
3. **"Reflection"** — asking the LLM to evaluate its own output (another LLM call)
4. **"Multi-agent"** — running multiple loops, sometimes feeding outputs between them (nested loops, message passing)

### What you already know

If you've written a REPL (read-eval-print loop), you understand the agent pattern. The only novelty is that the "eval" step is non-deterministic because it's an LLM call instead of a function call.

The real engineering challenge isn't the loop — it's managing the context window, handling errors gracefully, and knowing when to stop.
