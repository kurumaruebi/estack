### Changed

- A deploy goes ahead when the only uncommitted changes already match what it deploys, and keeps them in git stash.

### Fixed

- The merge loop model check uses the fixed TLA+ tools v1.7.4 release. The v1.8.0 download is a rolling pre-release whose file changed, so its checksum no longer matched.
