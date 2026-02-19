---
title: Serverless
aka:
  - FaaS
  - Functions as a Service
  - Lambda Functions
tagline: Serverless is just someone else's server with process isolation and extra steps
primitives:
  - process isolation
  - event-driven invocation
  - managed infrastructure
category: historical
origin: vendor
audience: infra
publishedAt: 2026-02-18
snippet:
  prose: "There is no cloud, it's just someone else's computer. Serverless takes this one step further: it's someone else's process on someone else's computer. You upload a function, a trigger fires, your code runs in an isolated environment, you get billed by the millisecond."
  lang: "python"
  code: |
    # What "serverless" looks like from the platform's perspective
    def handle_request(event):
        container = pool.get_or_create("user-123-fn-abc")
        result = container.invoke(user_function, event)
        bill(user="user-123", duration_ms=container.last_duration)
        return result
draft: false
---

## What they say

Serverless lets you "focus on your code, not infrastructure." You "never think about servers again." It "scales automatically to zero" and you "only pay for what you use." AWS Lambda, Cloudflare Workers, Vercel Functions — all promise to eliminate operations entirely.

## What it actually is

There is a server. You just don't manage it.[^1]

"Serverless" means: you upload a function, the provider runs it in a sandboxed environment when a trigger fires (HTTP request, queue message, cron schedule), and you get billed per invocation. The provider handles provisioning, scaling, and teardown.

### The pattern in pseudocode

```python
# What the serverless platform does when your function is invoked

def handle_invocation(trigger_event):
    # 1. Find or create an execution environment
    sandbox = pool.get_warm(function_id)
    if not sandbox:
        sandbox = create_sandbox(function_id)   # cold start
        sandbox.load(user_code)

    # 2. Run the user's function inside the sandbox
    result = sandbox.invoke(handler, trigger_event)

    # 3. Bill by duration
    bill(function_id, sandbox.execution_time_ms)

    # 4. Keep the sandbox warm for a bit, then recycle
    pool.return_warm(sandbox, ttl=minutes(5))

    return result
```

That's the platform side. From your side, you wrote a function and uploaded it. The "serverless" part is everything the platform does around it.[^2]

### The "extra steps"

1. **Cold starts** — creating a new execution environment when no warm one is available (process spawn + dependency loading)
2. **Auto-scaling** — running more instances when traffic increases (load balancer + pool management)
3. **Scale-to-zero** — shutting down all instances when there's no traffic (the key selling point, also the cause of cold starts)
4. **Event binding** — connecting triggers (HTTP routes, queue subscriptions, cron) to function invocations (event routing)
5. **Billing granularity** — metering execution time in milliseconds instead of hours (a billing model, not a technology)

### What you already know

If you've written a CGI script — a program that runs when a web server receives a request, does its work, and exits — you've written a serverless function. The execution model is identical.

```python
# CGI script (1993)
#!/usr/bin/env python
import cgi
form = cgi.FieldStorage()
name = form.getvalue("name", "World")
print(f"Content-Type: text/html\n\nHello, {name}!")
# Process exits. Server spawns a new one for the next request.

# AWS Lambda (2014) — same idea, managed
def handler(event, context):
    name = event.get("name", "World")
    return {"statusCode": 200, "body": f"Hello, {name}!"}
# Runtime stays warm briefly. Platform manages lifecycle.
```

The difference is that AWS handles the server, the process pool, the scaling, and the billing. The programming model — "a function that takes an event and returns a response" — is unchanged from 1993.[^3]

[^1]: The joke "there is no cloud, it's just someone else's computer" has been on [stickers](https://www.redbubble.com/shop/there+is+no+cloud) since 2015. It's reductive but accurate. Every serverless invocation runs on a physical machine in a data center — you just don't pick which one.
[^2]: [AWS Lambda — Wikipedia](https://en.wikipedia.org/wiki/AWS_Lambda) — launched November 2014. The execution model uses either containers (Lambda) or V8 isolates (Cloudflare Workers) for sandboxing. Different isolation mechanisms, same pattern: run user code, limit resources, bill per invocation.
[^3]: [Common Gateway Interface — Wikipedia](https://en.wikipedia.org/wiki/Common_Gateway_Interface) — CGI (1993) defined the "run a program per request" model that serverless functions reinvented. The key difference is lifecycle management: CGI spawns a new process per request, while serverless platforms keep warm instances in a pool to avoid the startup cost.
