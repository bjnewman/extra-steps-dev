---
title: Guardrails
aka:
  - AI Safety Filters
  - Content Filters
  - Output Guards
tagline: Guardrails are just input validation and output sanitization with extra steps
primitives:
  - input validation
  - output sanitization
  - regex / classifier filters
category: patterns
origin: industry
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "Check the input before processing it. Check the output before returning it. Reject or transform anything that doesn't pass. It's the same pattern as web form validation and HTML sanitization — applied to natural language instead of HTML."
  lang: "typescript"
  code: |
    function guardrail(input: string, output: string) {
      if (containsPII(input))    throw new Error("PII detected in input");
      if (isOffTopic(input))     throw new Error("Input out of scope");
      if (containsHarmful(output)) return FALLBACK_RESPONSE;
      if (!matchesSchema(output))  return retry(input);
      return output;
    }
draft: false
---

## What they say

Guardrails are "safety layers" that "ensure AI systems behave responsibly" by "preventing harmful, biased, or off-topic outputs." They're presented as a novel challenge unique to AI — something that requires specialized frameworks and "AI safety expertise."

## What it actually is

Validate the input. Sanitize the output. Reject or transform anything that fails the checks.[^1]

This is the same pattern every web developer has implemented since the first form submission: don't trust user input, don't return unsanitized output.

### The pattern in pseudocode

```typescript
async function handleRequest(userInput: string): Promise<string> {
  // 1. Input validation — same as form validation
  if (containsPII(userInput)) {
    return "I can't process messages containing personal information.";
  }
  if (isOffTopic(userInput, allowedTopics)) {
    return "I can only help with questions about our product.";
  }

  // 2. Call the LLM
  const response = await llm.chat({ messages: [{ role: "user", content: userInput }] });

  // 3. Output sanitization — same as HTML encoding
  if (containsHarmfulContent(response.text)) {
    return SAFE_FALLBACK_RESPONSE;
  }
  if (!matchesExpectedFormat(response.text)) {
    return await retry(userInput);  // or return a fallback
  }

  return response.text;
}
```

Input validation → processing → output sanitization. The pipeline is identical to a web request handler.[^2]

### The "extra steps"

1. **Prompt injection detection** — checking if the user is trying to override the system prompt (the SQL injection of LLMs)
2. **Topic classification** — ensuring the input is within the system's intended scope (allowlist/denylist, just like URL routing)
3. **PII detection** — scanning for personal data before it reaches the model (regex patterns + NER, same as GDPR compliance filters)
4. **Output classification** — running the output through a classifier to detect harmful content (another model call or a rule set)
5. **Schema validation** — ensuring structured output matches the expected format (JSON schema validation, same as API response validation)

### What you already know

If you've sanitized HTML to prevent XSS, you understand guardrails. The threat model changed — "injection" means prompt injection instead of script injection — but the defense pattern is identical:

```typescript
// Web security — you've written this
function sanitizeHTML(input: string): string {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// LLM guardrail — same idea, different domain
function sanitizePrompt(input: string): string {
  if (looksLikeInjection(input)) return "[blocked]";
  return stripPII(input);
}

// Both: don't trust input, clean output, fail safe
```

The tooling is different (classifiers instead of regex, though regex still works for PII), but the principle is the same: never trust the input, always check the output, and have a fallback for when things go wrong.[^3]

[^1]: [Input validation — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) — the exact same principles apply. Allowlists over denylists, validate on the server side, and fail closed. The OWASP cheat sheet for input validation reads like a guardrails implementation guide with "user" replaced by "LLM."
[^2]: [Guardrails AI](https://www.guardrailsai.com/) and [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) are popular frameworks. Under the hood, they're pipelines of validators and transformers — the same middleware pattern as Express.js middleware or Django middleware, applied to LLM inputs and outputs.
[^3]: [Prompt injection — OWASP LLM Top 10](https://genai.owasp.org/) — prompt injection is on the OWASP Top 10 for LLM Applications. The defense strategies (input filtering, output validation, least privilege) mirror the existing OWASP Top 10 for web applications almost exactly. New attack surface, same defense playbook.
