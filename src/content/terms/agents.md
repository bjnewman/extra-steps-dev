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
snippet:
  prose: "An agent is a while loop. Each iteration: send messages to LLM, get back either a tool call or a final response. Execute the tool, append the result, repeat. Everything else is optimization."
  lang: "python"
  code: |
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
draft: false
---

## What they say

AI agents are "autonomous entities that can reason, plan, and take action to achieve complex goals." They "break down tasks, use tools, and adapt their approach based on intermediate results."

## What it actually is

An agent is a loop. The observe→think→act pattern[^1] maps directly to: send messages to LLM, get back a tool call or final response, execute the tool, repeat.

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

That's the entire architecture. Everything else is optimization.[^2]

### The "extra steps"

1. **"Planning"** — prompting the LLM to output a plan before acting (chain of thought)
2. **"Memory"** — appending to the message array, or summarizing older messages when it gets too long (array management)
3. **"Reflection"** — asking the LLM to evaluate its own output (another LLM call)
4. **"Multi-agent"** — running multiple loops, sometimes feeding outputs between them (nested loops, message passing)

### What you already know

If you've written a REPL (read-eval-print loop), you understand the agent pattern. The only novelty is that the "eval" step is non-deterministic because it's an LLM call instead of a function call.

The real engineering challenge isn't the loop — it's managing the context window, handling errors gracefully, and knowing when to stop.[^3]

[^1]: [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — Yao et al., 2022. The paper that formalized the observe→think→act loop. The agent pattern is essentially this paper implemented in a while loop.
[^2]: [Building effective agents](https://www.anthropic.com/research/building-effective-agents) — Anthropic, 2024. Notable for explicitly recommending simple loops over complex frameworks, and for the section on when *not* to use agents at all.
[^3]: [Anthropic tool use overview](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) — The API response structure you're actually dispatching on. The `stop_reason: "tool_use"` field is the loop condition.
