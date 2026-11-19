---
name: correct
description: Turn a mistake that happened two times into a guard that stops it, not into more prose. Use when the owner says "again" or "make sure this does not happen again", when a review repeats the same finding, or when you are about to write the same warning into AGENTS.md, a skill, or memory a second time.
---

# Correct

A rule that only lives in text gets broken again. When the same mistake
happens two times, change the code or the tools so that the mistake cannot
be written, or cannot pass a check.

## When to use

- The owner says "again", "また", or "make sure this does not happen again".
- A review or CI finds the same problem that an earlier review found.
- You are about to add a second "do not" line for the same problem to
  `AGENTS.md`, a skill, or memory.

For the first time a mistake happens, fix it and add one row to the
"1 回目" section of `estack/決まりと止める仕組み.md`. Do not build a guard yet.

## Inputs

- The two (or more) real examples of the mistake: commit, PR comment, log
  line, or the owner's words. Get the exact text. Do not paraphrase.
- `estack/決まりと止める仕組み.md`: the rules that already have a guard.

## Steps

1. Find the real examples. If you cannot find two, stop and use the
   first-time path above.
2. Choose the strongest guard that fits. Try them in this order and use the
   first one that works:
   1. Design: make the mistake impossible to write (a type, a module
      boundary, one function that all callers must use, a removed option).
   2. Static check: a type, a Biome or GritQL rule, or a script in
      `scripts/estack/` that runs in `.githooks/pre-commit` and in
      `.github/workflows/estack-ci.yml`.
   3. Behavior test: a test that fails on the mistake.
   4. Text: a line in a skill or `AGENTS.md`. Use this only when 1 to 3
      cannot catch the mistake, and say why in the row.
3. Prove the guard on the real example. Put the real bad input back (in a
   test fixture, or on a scratch branch) and show that the guard stops it.
   Then show that the correct code passes. A guard that you did not see
   fail is not a guard.
4. Keep the guard narrow. It must not stop correct code that already exists:
   run it on the whole tree (`--all` or the full test file) and fix false
   positives before you commit.
5. Add or move the row in `estack/決まりと止める仕組み.md`: the rule, the
   guard files in backticks, and the real mistake that the guard stopped.
   `scripts/estack/rules-table.test.ts` checks that each guard file exists.
6. Remove the prose that the guard replaces (the old "do not" lines in
   skills, `AGENTS.md`, or memory).
7. Commit the guard, its test, and the table row together.

## Verification

- The output of the guard on the real bad example (it stops).
- The output of the guard on the whole tree (it passes).
- `bun run test:related scripts/estack/rules-table.test.ts` passes.

## Output

One short report: the mistake (with the two examples), the guard you chose
and why the stronger levels did not fit, the proof from step 3, and the
commit.

## Approval

- No approval for a new check, test, or type change in this repository.
- Ask the owner first when the guard changes how the owner works (for
  example, a hook that blocks a command the owner uses), or when the guard
  needs a change outside this repository.
