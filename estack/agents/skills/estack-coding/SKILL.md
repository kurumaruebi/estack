---
name: estack-coding
description: Ask the Mac worker to change the estack code and get back a pull request with checks, screenshots, and a review. Use when an agent must change code in the estack repository, follow up on its pull request, or merge it after the owner approved.
---

# estack coding

## When to use

- A change to the estack code: a fix, a feature, a test, a rule.
- A follow-up on the same pull request (review findings, failed CI).
- A merge, only after the owner approved the pull request in chat.

## Inputs

- The owner's request, in the brief form: goal, done-when, evidence, known, constraints.
- `~/Projects/estack/estack/bin/coding` (all commands below).

## Steps

1. Write the brief. One sentence each. Do not write how to do it or your guess of the cause.
2. Queue it:

   ```sh
   ~/Projects/estack/estack/bin/coding request --by "<your name>" \
     --goal "…" --done-when "…" --evidence "…" [--known "…"] [--constraints "…"]
   ```

   It prints the job id. Use `--cli codex` only when the owner asks for Codex.
3. The Mac worker takes the job when the Mac is on. It can take 10 to 60 minutes. Check with
   `coding status <job id>`. Do not wait in a loop: check again on your next turn or routine.
4. When the result has a pull request, read it with `coding checks <job id>` (CI) and the
   result summary (local checks, verification, review, evidence places).
5. For a follow-up on the same pull request: `coding request --follow-up <job id> …`.
6. After the owner approves in chat: `coding merge <job id> --approved "<who approved, when, where>"`. The worker refuses a merge without it and writes it on the pull request and in the decision log. The worker merges only when CI is
   green, and the VPS then pulls and restarts the dev stack.

## Verification

The result has a pull request URL, local checks that pass, and evidence (screenshot places or the
reason there is none).

## Evidence

- The result lists each screenshot as a place: `vps:<key>/<file>` is `~/estack-evidence/<key>/<file>` on the VPS,
  `mac:<key>/<file>` stayed in the work folder of the Mac worker because the VPS did not take it.
- Attach the `vps:` files to your message in the 開発 channel. Never put a screenshot in the repository, a pull
  request, or a link to GitHub: the repository is public.

## Output

Tell the person who asked: the pull request URL, what changed, the evidence, and what was not checked.

## Approval

- `coding merge` needs the owner's approval in chat, every time.
- `coding request` needs no approval. The worker never pushes to main.
