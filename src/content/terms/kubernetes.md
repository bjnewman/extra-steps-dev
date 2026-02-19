---
title: Kubernetes
aka: K8s
tagline: Kubernetes is just a reconciliation loop watching YAML files with extra steps
primitives:
  - control loop
  - declarative config
  - container orchestration
category: historical
origin: industry
audience: infra
publishedAt: 2026-02-18
snippet:
  prose: "A Kubernetes controller is a loop: read the desired state from a YAML file, observe the actual state of the cluster, compute the diff, take action to converge. Every controller in the system runs this same loop independently."
  lang: "python"
  code: |
    while True:
        desired = read_spec("deployment.yaml")   # what you asked for
        actual  = observe_cluster()               # what's running
        diff    = desired - actual                 # what's wrong
        for action in plan(diff):
            execute(action)                        # fix it
        sleep(interval)
draft: false
---

## What they say

Kubernetes is a "production-grade container orchestration" platform that provides "automated deployment, scaling, and management of containerized applications." It "abstracts away the underlying infrastructure" and gives you a "self-healing, declarative system."

## What it actually is

Kubernetes is a collection of control loops.[^1] Each loop (called a "controller") does the same thing:

1. Read the desired state (a YAML file you wrote)
2. Observe the actual state (query the cluster)
3. Compute the diff
4. Take action to converge actual → desired
5. Repeat

That's the entire architecture. Everything else — Pods, Services, Deployments, StatefulSets — is just a different *thing* the loop watches and reconciles.

### The pattern in pseudocode

```python
# This is what every Kubernetes controller does
while True:
    desired = api_server.get("Deployment", "my-app")  # what the YAML says
    actual  = api_server.list("Pod", labels={"app": "my-app"})  # what's running

    if len(actual) < desired.replicas:
        api_server.create("Pod", template=desired.pod_template)
    elif len(actual) > desired.replicas:
        api_server.delete("Pod", pick_one(actual))

    sleep(30)
```

The "Deployment controller" is literally this loop. The "ReplicaSet controller" is this loop. The "Node controller" is this loop. Different objects, same pattern.[^2]

### The "extra steps"

1. **API server** — a central REST API that stores all desired state in etcd (just a key-value store behind an HTTP API)
2. **etcd** — a distributed key-value store that holds every YAML object you've applied (the source of truth)
3. **Scheduler** — a controller that watches for unassigned Pods and picks a node for them (bin-packing algorithm)
4. **Kubelet** — an agent on each node that watches for Pods assigned to it and runs the containers (the Docker/containerd client)
5. **Networking** — kube-proxy, CNI plugins, and DNS so Pods can find each other (iptables rules and virtual networks)

### What you already know

If you've written a cron job that checks "are all my services running?" and restarts any that crashed, you've written a Kubernetes controller.

```bash
# A cron job you might have written
*/1 * * * * pgrep my-app || systemctl restart my-app

# What a Kubernetes controller does — same pattern
while true; do
  actual=$(count_running_pods "my-app")
  desired=$(read_replica_count "my-app")
  if [ "$actual" -lt "$desired" ]; then
    create_pod "my-app"
  fi
  sleep 30
done
```

The difference is that Kubernetes generalizes this pattern across every type of resource — Pods, Services, Ingresses, ConfigMaps — using the same watch-diff-reconcile loop. The complexity isn't in any single loop; it's in the number of loops running simultaneously and the interactions between them.[^3]

[^1]: [Kubernetes Controllers](https://kubernetes.io/docs/concepts/architecture/controller/) — the official documentation explicitly describes them as "control loops that watch the state of your cluster." The reconciliation pattern is not an implementation detail; it's the documented architecture.
[^2]: [Reconciliation loop — Wikipedia](https://en.wikipedia.org/wiki/Control_loop) — the same feedback-loop pattern used in industrial control systems, thermostats, and cruise control. Kubernetes applied it to infrastructure management. Google's internal predecessor, Borg, used the same approach.
[^3]: [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/) — the full system is many controllers running concurrently. The API server + etcd is the shared state store; each controller watches a subset of objects and reconciles independently. The complexity comes from the interactions, not the individual loops.
