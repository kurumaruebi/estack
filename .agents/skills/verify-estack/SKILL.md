---
name: verify-estack
description: Prove that a change to estack works in the real app, with evidence that the owner can see. Use in every coding job from the Mac worker, after a fix, and before you say that a change works. A green build or green tests is not proof.
---

# Verify estack

The proof of a change is the running app, not the build. Show the owner
what changed with a screenshot, a snapshot of the screen, or a measured
value. Say clearly what you could not check.

## When to use

- In a coding job from the Mac worker (the brief names this skill).
- After you fix a bug, before you report that it is fixed.
- When the owner asks "does it work?" or asks for evidence.

## Inputs

- The change: `git diff --name-only origin/main...HEAD`.
- `estack/機能の一覧.md`: each feature, where it shows, and how to check it.
- The "Evidence to show" line of the brief.

## Steps

1. Find the features that the change touches in `estack/機能の一覧.md`. If a
   changed area has no row, add one in the same commit.
2. Write the test plan: for each feature, one user action and one expected
   result. Include the reverse action for each state change.
3. Check what you can inside your session: the unit tests of the changed
   files (`bun run test:related <files>`), `bun run typecheck`, and a direct
   run of a script you changed. The session has no network, so do not start
   the dev app yourself.
4. For a change that shows in the desktop or web UI, write
   `.estack-build/verify-plan.json`. After your session, the Mac worker
   starts the dev app in this worktree, runs the steps with
   `bun run dev:automation`, and stores the screenshots in the private
   evidence store on the VPS. The pull request names each place, never the
   image itself, because the repository is public. The lead attaches the
   images in the 開発 channel:

   ```json
   {
     "steps": [
       { "action": "snapshot", "waitFor": "heading,Build your AI team." },
       { "action": "click", "role": "button", "name": "Settings", "waitFor": "heading,Settings" },
       { "action": "type", "role": "textbox", "name": "Name", "text": "Test" },
       { "action": "screenshot", "out": "settings-after.png", "expect": "The job count shows 3." }
     ]
   }
   ```

   Actions are `snapshot`, `click`, `type`, and `screenshot`. Select by
   accessible role and name. `out` is a lowercase file name that ends in
   `.png`. Put the expected result in `expect`. Use at most 40 steps.
5. For a change that shows only on the phone, give the steps for the owner
   in the report. The worker cannot drive the phone.
6. Write `.estack-build/report.md` (git ignores it). The worker puts it at
   the top of the pull request:

   ```markdown
   ## What changed
   One to three lines.

   ## How I checked it
   | # | Feature | Action | Expected | Result | Evidence |
   |---|---|---|---|---|---|

   ## Not checked
   Each item, and why.
   ```

## Verification

The report has one row for each feature that the change touches. Each row
has evidence: a test name, a command output, or a screenshot name from the
verify plan. "Not checked" is empty only when you checked everything.

## Output

The commits, `.estack-build/report.md`, and `.estack-build/verify-plan.json`
when the change shows in the UI.

## Approval

No approval. Do not push, open a pull request, or merge: the worker does
that after the checks pass.
