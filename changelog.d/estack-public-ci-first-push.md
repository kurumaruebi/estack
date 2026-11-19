### Fixed

- The repository's CI no longer fails on its very first push. A single-commit history has no base to compare with, so the workflow now skips the two diff-based checks for that one run and runs the rest as usual.
