---
title: Dropbox
tagline: Dropbox is just rsync with a GUI and extra steps
primitives:
  - rsync
  - inotify
  - cloud storage
category: historical
origin: industry
audience: app-dev
publishedAt: 2026-02-18
snippet:
  prose: "Watch a folder for changes, sync the diffs to a remote server. Dropbox's genius was making that invisible — but the primitives are file-watching, delta transfer, and a storage backend. BrandonM was right about the parts, wrong about the product."
  lang: "bash"
  code: |
    # Watch for changes, sync the diffs
    inotifywait -mr ~/Dropbox -e modify,create,delete |
      while read path action file; do
        rsync -avz ~/Dropbox/ remote:~/backup/
      done
draft: false
---

## What they say

Dropbox is "the simplest way to keep your files in sync." When it launched at Y Combinator in 2007, the pitch was magical: install it, get a folder, anything you put in the folder appears on all your devices.

## What it actually is

Watch a directory for file changes. Compute diffs. Transfer the diffs to a remote server. Apply them on other clients. That's the core loop.[^1]

### The pattern in pseudocode

```bash
# 1. Watch a directory for changes (inotify on Linux, FSEvents on macOS)
inotifywait -mr ~/Dropbox -e modify,create,delete

# 2. Compute and transfer diffs (rsync's core algorithm)
rsync -avz ~/Dropbox/ remote:~/sync/

# 3. On the other side, apply the diffs to the local copy
rsync -avz remote:~/sync/ ~/Dropbox/
```

The delta transfer algorithm — splitting files into chunks, computing rolling checksums, sending only the changed blocks — is literally what rsync does.[^2]

### The "extra steps"

1. **Filesystem watching** — monitoring a folder for changes in real-time instead of running sync manually (inotify/FSEvents)
2. **Block-level dedup** — splitting files into 4MB chunks and only storing unique blocks (content-addressable storage)
3. **Conflict resolution** — handling the case where two clients edit the same file (last-writer-wins with "conflicted copy" fallback)
4. **Cross-platform GUI** — making the sync folder feel native on Windows, macOS, and Linux (the actual product moat)

### What you already know

If you've ever run `rsync -avz` to back up a folder to a remote server, you've done the hard part. Dropbox automated the trigger (filesystem events instead of a cron job) and added a storage backend.

```bash
# You've done this
rsync -avz ~/projects/ server:~/backup/

# Dropbox does this, triggered by filesystem events, continuously
while true; do
  wait_for_changes ~/Dropbox
  sync_deltas ~/Dropbox cloud://storage/
  pull_deltas cloud://storage/ ~/Dropbox
done
```

The reason Dropbox is worth $8B and rsync isn't[^3] has nothing to do with the algorithm. It's the GUI, the cross-platform client, the sharing links, the collaboration features, and the fact that your parents can use it without opening a terminal. The primitives were never the moat — the product was.

[^1]: [BrandonM on Hacker News](https://news.ycombinator.com/item?id=9224) — the comment that launched a thousand takes. "For a Linux user, you can already build such a system yourself quite trivially by getting an FTP account, mounting it locally with curlftpfs, and then using SVN or CVS..." Technically right. Commercially irrelevant.
[^2]: [rsync algorithm — Wikipedia](https://en.wikipedia.org/wiki/Rsync#Algorithm) — the rolling checksum and delta transfer algorithm. Dropbox's sync engine uses a similar chunking approach, though their block-level dedup goes further than rsync's file-level diffing.
[^3]: Drew Houston resurfaced BrandonM's comment at Dropbox's IPO in 2018. The original HN submission for Dropbox is [item 8863](https://news.ycombinator.com/item?id=8863) — one of the most famous Show HN posts ever.
