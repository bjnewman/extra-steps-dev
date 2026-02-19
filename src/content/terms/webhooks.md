---
title: Webhooks
aka:
  - HTTP Callbacks
  - Event Notifications
  - Push Notifications
tagline: Webhooks are just HTTP POST callbacks with extra steps
primitives:
  - HTTP POST
  - callback function
category: patterns
origin: industry
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "When something happens, send an HTTP POST to a URL someone registered. That's a webhook. 'Event-driven architecture' in SaaS is usually just one server POSTing JSON to another server's endpoint when state changes."
  lang: "typescript"
  code: |
    // The webhook sender — just a POST request
    await fetch(registeredUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "payment.succeeded", data: payment }),
    });
draft: false
---

## What they say

Webhooks enable "event-driven architectures" and "real-time integrations." They let services "react to events as they happen" and build "loosely coupled, reactive systems." SaaS platforms describe their webhook support as a core integration capability.

## What it actually is

When something happens, send an HTTP POST to a URL that someone registered ahead of time.[^1]

That's the entire concept. A webhook is a callback over HTTP. The "event-driven architecture" is: something changed → POST a JSON payload to a URL → the receiver handles it.

### The pattern in pseudocode

```typescript
// SENDER: when something happens, POST to registered URLs
async function emitEvent(event: string, data: any) {
  const subscribers = await db.query(
    "SELECT url FROM webhooks WHERE event = ?", [event]
  );
  for (const sub of subscribers) {
    await fetch(sub.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, timestamp: Date.now() }),
    });
  }
}

// When a payment succeeds:
await emitEvent("payment.succeeded", { id: "pay_123", amount: 4999 });

// RECEIVER: handle the incoming POST
app.post("/webhooks/stripe", (req, res) => {
  const { event, data } = req.body;
  if (event === "payment.succeeded") processPayment(data);
  res.sendStatus(200);
});
```

The sender has a list of URLs. When an event fires, it POSTs to each URL. The receiver exposes an endpoint that handles the payload. That's webhooks.[^2]

### The "extra steps"

1. **Signature verification** — the sender signs the payload with a shared secret so the receiver can verify it's authentic (HMAC, same as API auth)
2. **Retry logic** — if the receiver returns a non-2xx status, retry with exponential backoff (standard retry pattern)
3. **Event filtering** — letting subscribers choose which events they care about (subscription management)
4. **Idempotency** — including a unique event ID so the receiver can deduplicate retried deliveries (idempotency keys)
5. **Delivery logs** — tracking which webhooks succeeded or failed (an audit log)

### What you already know

If you've ever passed a callback function to an event listener, you understand webhooks. The callback just happens over HTTP instead of in-process:

```typescript
// In-process callback — you've written this
button.addEventListener("click", (event) => {
  handleClick(event.data);
});

// Webhook — same pattern, over HTTP
stripe.webhooks.register("payment.succeeded", "https://myapp.com/hooks/stripe");

// Both: "when X happens, call this function/URL with the event data"
```

The mental model is identical: register a handler, wait for an event, process the payload. The transport changed from a function call to an HTTP request, which adds the retry/auth/idempotency concerns — but the pattern is a callback.[^3]

[^1]: [Webhook — Wikipedia](https://en.wikipedia.org/wiki/Webhook) — the term was coined by Jeff Lindsay in 2007. The concept — "user-defined HTTP callbacks" — predates the name. It's the inverse of polling: instead of the client asking "did anything change?" repeatedly, the server tells the client when something changes.
[^2]: [Stripe Webhooks](https://docs.stripe.com/webhooks) — the canonical modern implementation. Stripe's webhook system is: register a URL, receive POST requests with JSON payloads, verify the signature, return 200. Every SaaS webhook system works essentially the same way.
[^3]: [Observer pattern — Wikipedia](https://en.wikipedia.org/wiki/Observer_pattern) — webhooks are the observer pattern over HTTP. The "subject" is the service emitting events; the "observers" are the registered URLs. Pub/sub, event emitters, and webhooks are all implementations of the same pattern at different scales.
