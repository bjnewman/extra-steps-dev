---
title: Docker
tagline: Docker is just cgroups and namespaces with a nice CLI and extra steps
primitives:
  - cgroups
  - namespaces
  - union filesystem
category: historical
origin: industry
audience: infra
publishedAt: 2026-02-18
snippet:
  prose: "A container is a process with resource limits (cgroups) and an isolated view of the system (namespaces). Docker didn't invent any of this — it made it usable. The underlying kernel features have existed since 2008."
  lang: "bash"
  code: |
    # What Docker does, the hard way
    unshare --mount --uts --ipc --net --pid --fork bash
    mount -t overlay overlay -o lowerdir=/base,upperdir=/diff,workdir=/work /merged
    echo $$ > /sys/fs/cgroup/memory/container1/cgroup.procs
    echo "512m" > /sys/fs/cgroup/memory/container1/memory.limit_in_bytes
draft: false
---

## What they say

Docker "revolutionized software delivery" by introducing containers — "lightweight, portable, self-sufficient units" that package an application and its dependencies together. Containers are presented as a fundamentally new way to deploy software, distinct from virtual machines.

## What it actually is

A container is a regular Linux process with two kernel features applied to it:[^1]

1. **Namespaces** — the process gets its own isolated view of PIDs, network interfaces, mount points, and hostnames. It *thinks* it's the only thing running.
2. **cgroups** (control groups) — the process gets resource limits: max memory, CPU shares, I/O bandwidth.

That's it. There's no hypervisor, no hardware virtualization, no separate kernel. It's one process, on the host kernel, with isolation and limits.

### The pattern in pseudocode

```bash
# 1. Create isolated namespaces (the "container" part)
unshare --mount --uts --ipc --net --pid --fork bash

# 2. Set up a layered filesystem (the "image" part)
mount -t overlay overlay \
  -o lowerdir=/ubuntu-base,upperdir=/my-app,workdir=/work \
  /merged

# 3. Apply resource limits (the "resource management" part)
echo $$ > /sys/fs/cgroup/memory/mycontainer/cgroup.procs
echo "512m" > /sys/fs/cgroup/memory/mycontainer/memory.limit_in_bytes

# 4. chroot into the merged filesystem
chroot /merged /bin/bash
```

You now have a "container." `docker run` does these four steps (plus networking, logging, and a lot of convenience) behind a single command.[^2]

### The "extra steps"

1. **Image format** — a layered filesystem built from a Dockerfile, stored as a tarball of diffs (union filesystem / overlay)
2. **Image registry** — Docker Hub, a central place to push/pull images (just an HTTP API serving tarballs)
3. **Networking** — virtual bridges and iptables rules so containers can talk to each other (standard Linux networking)
4. **Build system** — Dockerfiles: a DSL that runs shell commands in sequence, snapshotting the filesystem after each step (cached, layered builds)
5. **CLI and daemon** — the UX layer that made all of the above a one-liner

### What you already know

If you've ever used `chroot` to set up a build environment, or set `ulimit` to restrict a process's resources, you've used the same kernel features that containers are built on.

```bash
# chroot — you've seen this
chroot /path/to/rootfs /bin/bash

# docker run — same idea, more isolation
docker run -it ubuntu bash

# Both give you a shell in an isolated filesystem.
# Docker adds namespace isolation, cgroup limits,
# and a layered image format on top.
```

Docker's real contribution was packaging these kernel primitives into a workflow that developers actually wanted to use. The Dockerfile, the image registry, `docker build && docker push` — that's the product.[^3]

[^1]: [Linux namespaces — Wikipedia](https://en.wikipedia.org/wiki/Linux_namespaces) — the kernel feature that provides process isolation. Mount, PID, network, UTS, IPC, and user namespaces have been in the kernel since 2002-2013. Docker uses all of them.
[^2]: [cgroups — Wikipedia](https://en.wikipedia.org/wiki/Cgroups) — control groups for resource limiting, introduced in Linux 2.6.24 (2008). Google engineers originally developed them for internal process management — years before Docker existed.
[^3]: Solomon Hykes' [dotCloud demo at PyCon 2013](https://www.youtube.com/watch?v=wW9CAH9nSLs) — the original Docker presentation. The pitch wasn't "we invented containers" — it was "we made them easy to use." The `Dockerfile` and `docker push`/`docker pull` workflow were the breakthrough, not the isolation primitives.
