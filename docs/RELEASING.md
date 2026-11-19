# Releasing estack

A release is a `v0.x.y` tag on `main`. A tag marks a stable point that a self-hosted server or a
script pins to. This repository publishes no binaries and no container images: each consumer runs
and builds from source, and pins the tag it wants.

`apps/mobile` has its own versions and its own notes; a native change to the iPhone or Android app
needs a new store build, which the operator makes with their own accounts. The desktop app and the
mobile app do not update themselves from this repository.

Codex, Claude, and Grok runtimes are optional downloads. They are not part of the application package.
Installed apps do not wait for a release to get a new provider CLI: they offer the latest upstream
release (see [Provider CLI updates](architecture/providers.md#provider-cli-updates)). The pinned version is the
first-install fallback. To stop a broken upstream release, add its version to the provider's list in
`provider-runtime-blocklist.json` and merge it to `main`. Apps read the list at their next check. A
blocked version is no longer offered, but it stays on the computers that already installed it.

## Build the remote desktop runtime

`native-runtime.lock.json` pins the upstream source for Sunshine `v2026.516.143833` and Moonlight Web
`v2.10.0` by full commit and source archive SHA-256. Each entry also records the reviewable estack
patch applied to that source. Build on the target platform:

```bash
bun run build:remote-desktop-runtime
bun run verify:remote-desktop-runtime
```

The command writes binaries, the static Moonlight viewer, GPL-3.0 licenses, corresponding-source
metadata, and SHA-256 checksums under `build/remote-desktop-runtime/<platform>/<arch>`. Publish the
exact corresponding source for both GPL components with every binary release. A release must stop if
a binary, license, source manifest, checksum, platform signature, or notarization result is missing.

Use this source build only to make or reproduce a runtime version. Publish the four deterministic
archives as an immutable GitHub prerelease named `remote-desktop-runtime-<input-digest>`, with SPDX
SBOMs, build provenance, and `remote-desktop-runtime-manifest.json`. It is not an estack application
update and it must never contain `latest.yml`.

A branch that changes the recipe must also pin by hand, or merging it leaves `main` with an unpinned
lock -- which is not a degraded state but a broken one, because
`prepare-remote-desktop-runtime.ts` throws and takes every `package`, `dist:mac`, `dist:win` and
`dist:linux` run with it. Publish the prerelease from the branch, then pin it:

```bash
gh release create remote-desktop-runtime-<input-digest> <archives> --prerelease
gh release download remote-desktop-runtime-<input-digest> --pattern remote-desktop-runtime-manifest.json
bun scripts/pin-remote-desktop-runtime.ts remote-desktop-runtime-manifest.json
```

Commit the rewritten `native-runtime.lock.json` to the branch and merge it with the recipe, so `main`
never sees the two apart. The pin does not change the input digest -- it covers `recipeVersion`, both
source entries and `targets`, not the artifacts -- so it cannot invalidate the release it just pinned.

Normal CI and application release jobs then use:

```bash
bun run install:remote-desktop-runtime
bun run verify:remote-desktop-runtime
```

The installer accepts only the exact prerelease and assets in the lock file. It rejects a changed
manifest, a changed archive, an unsafe archive path, and a mismatched source manifest. Do not replace
assets in an existing runtime prerelease. Increase `recipeVersion` when the build process changes.

### Sunshine security backports (runtime recipe 12)

The Sunshine upstream base remains `v2026.516.143833` to keep the tested macOS input backend.
The estack patch includes these upstream security changes and regression tests:

- `1583e7c4a7e99538c7700315a1d2a2101c6d2812`: validate input packets before queueing and
  dispatch (GHSA-26q2-58j6-qmvv and GHSA-6w33-pjh7-p77c).
- `82bccdf69894ee03ac422cc787f1ac9654da359d`: reject short ENet control packets
  (GHSA-c428-87f8-rrv5).
- `ccf97e38796be6cfcbff0ef248a684d39e181eba`: bind pairing approval to an explicit,
  expiring request ID (GHSA-36ff-frg7-492f).
- `4d768847fcd88cc94ac745c4611715c67d7d67e1`: require the exact enabled client
  certificate and canonicalize stored certificate identities (GHSA-6jvv-jqr7-m6m3).

Backport adaptations retain the older platform APIs and test fixtures. Native CI builds and runs
only the relevant packet, pairing, REST authorization, and certificate regression tests. The local
Moonlight client uses a random pairing name and approves only its matching loopback request ID.
Moonlight now builds from the same upstream commit with the existing estack patch and a fix
that sends the configured pairing name instead of the upstream hard-coded name.
The published runtime uses a new recipe/input digest; no existing release assets are replaced.
The Linux GUI capability advisory GHSA-fp6g-27w5-489j does not apply: the Linux runtime is built
with the tray off, and estack gives Sunshine no file capabilities.

### Linux runtime (recipe 16)

The `linux-x64` target builds on Ubuntu 24.04 with GCC 14, X11 capture and software encoding only
(CUDA, DRM, KWin, VAAPI, Vulkan, Wayland, portal and tray are off). The estack patch adds an XTest
input backend, because Xvfb does not read uinput devices. It also links libcap when DRM is off and
adds a `vaMapBuffer2` shim, because the prebuilt FFmpeg needs libva 2.21 and Ubuntu 24.04 has 2.20.
The runtime uses the system libraries of Ubuntu 24.04 that Ubuntu 26.04 also has; the hosted server
template installs them (the remote desktop part of `scripts/hosting/packages.txt`). Since recipe 16,
Boost.Locale has no ICU backend, and the runtime carries `lib/libminiupnpc.so.17` with its Debian
licence, because Ubuntu 26.04 has only `libminiupnpc21`. Sunshine finds it through its RUNPATH
`$ORIGIN/lib`. The build job checks with `ldd` that each executable finds all its libraries on
Ubuntu 26.04.
Linux arm64 builds only for local development and has no release artifact.

## Pin the Gemini CLI

`native-runtime.lock.json` pins Google's Antigravity CLI for the Gemini provider by hand. Read the
tag of `https://api.github.com/repos/google-antigravity/antigravity-cli/releases/latest` and set
`version` to it (the tags have no `v`). For each target, download `agy_cli_<target>.tar.gz`
(`agy_cli_windows_x64.zip` on Windows) from that release, and check its SHA-256 against the asset
`digest`. Set `url`, `assetSha256`, `downloadBytes`, `installedBytes` (the size of the extracted
`antigravity` or `antigravity.exe`) and the SHA-256 of `bin/antigravity` (`bin/antigravity.exe` on
Windows). Do not commit an archive: Google's license does not allow redistribution.

## Pin the Cursor CLI

`native-runtime.lock.json` pins the Cursor CLI by hand. Read the ACP registry entry `cursor`: its
`version` is the date, and each `archive` URL has the build, a date and a commit such as
`2026.09.28-64d2043`. Set `version` to the build. For each target, download
`downloads.cursor.com/lab/<build>/<os>/<arch>/agent-cli-package.tar.gz` (`.zip` on Windows), and
set the archive SHA-256 and size, `installedBytes` above the extracted size, and the SHA-256 of
each file in `files`. The paths in `files` are relative to `dist-package/`. Do not commit the
archives: Cursor's terms do not allow redistribution.

## Pin the Cline CLI

`native-runtime.lock.json` pins the Cline CLI by hand. Read the npm `latest` version of
`@cline/cli-darwin-arm64` and set `version`. For each target, download the platform package
`@cline/cli-<os>-<arch>` (`windows-x64` for Windows) from `registry.npmjs.org`, and set the tarball
SHA-256 and size, the SHA-256 of `bin/cline` (`bin/cline.exe` on Windows) and of
`extensions/plugin-sandbox-bootstrap.js`, and `installedBytes` above the extracted size. The npm
packages have no license file, so set `licenseSha256` to the SHA-256 of `LICENSE` at the
`cli-v<version>` tag of `github.com/cline/cline`.

## Pin the Kimi CLI

`native-runtime.lock.json` pins the Kimi Code CLI by hand. Read the `releases/latest` tag of
`github.com/MoonshotAI/kimi-cli` and set `version` and `tag` (the tag has no `v`). For each target,
download `kimi-<version>-<triple>-onedir.tar.gz` (`.zip` on Windows) from that release, and set the
asset SHA-256 and size, `installedBytes` above the extracted size, and the SHA-256 of each file in
`files`: `kimi` (`kimi.exe` on Windows), `_internal/base_library.zip` and the Python library. The
paths in `files` are relative to the archive's `kimi/` folder. Do not follow or copy the symbolic
links in the archive. Set `licenseSha256` to the SHA-256 of `LICENSE` at the version tag.

## Pin the Devin CLI

`native-runtime.lock.json` pins the Devin CLI by hand. Read `version` from
`https://static.devin.ai/cli/current/manifest.json` and set `version`. For each target, download
`devin-<version>-<triple>.tar.gz` (`.zip` on Windows) from `https://static.devin.ai/cli/<version>/`,
and check its SHA-256 against the manifest `sha256`. Set `url`, `assetSha256`, `downloadBytes`,
`installedBytes` (the size of the extracted `bin/` and `share/` folders), and the SHA-256 of
`bin/devin` (`bin/devin.exe` on Windows). `share/` holds only documentation, so it is not in
`files`.

## Pin the GitHub Copilot CLI

`native-runtime.lock.json` pins the GitHub Copilot CLI by hand. Read the tag of
`https://api.github.com/repos/github/copilot-cli/releases/latest` and set `version` without its
`v`. For each target, download `copilot-<target>.tar.gz` (`copilot-win32-x64.zip` on Windows) from
that release, and check its SHA-256 against the asset `digest`. Set `url`, `assetSha256`,
`downloadBytes`, `installedBytes` (the size of the extracted `copilot` or `copilot.exe`) and the
SHA-256 of `bin/copilot` (`bin/copilot.exe` on Windows).

## Pin Mistral Vibe

`native-runtime.lock.json` pins Mistral Vibe's ACP server by hand. Read the tag of
`https://api.github.com/repos/mistralai/mistral-vibe/releases/latest` and set `version` without its
`v`, and `licenseUrl` to `LICENSE` at that tag. For each target, download
`vibe-acp-<triple>-<version>.tar.gz` (`.zip` on Windows) from that release, and check its SHA-256
against the asset `digest`. Set `url`, `assetSha256`, `downloadBytes`, `installedBytes` above the
extracted size, and the SHA-256 of each file in `files`: `bin/vibe-acp` (`bin/vibe-acp.exe` on
Windows), `bin/_internal/base_library.zip`, the Python library, and
`bin/_internal/mistral_vibe-<version>.dist-info/licenses/LICENSE`. Do not follow or copy the symbolic
links in the archive.

## Pin the OpenCode CLI

`native-runtime.lock.json` also pins the OpenCode CLI that estack downloads for the OpenCode
provider before its first update check answers, by `@opencode/cli-*` npm platform package (OpenCode 2), asset SHA-256,
extracted binary SHA-256, byte counts, and the MIT license file. The OpenCode 2 tarballs carry no license, so the lock
names an `opencode-ai` (OpenCode 1) release in `licensePackage` and the app installs the same MIT file from it. Codex,
Claude, and Grok are pinned in the same file by hand; OpenCode has a script, because the version, all five platform
packages, and the license have to agree:

```bash
bun run pin:opencode-runtime                # the newest published release
bun run pin:opencode-runtime 2.1.1          # one exact version
bun run pin:opencode-runtime 2.1.1 1.19.3   # and one exact `opencode-ai` release for the license
```

The script downloads all five platform tarballs, checks that `package/package.json` names the package
and version the lock claims, hashes the extracted binary and the license, and runs the extracted
binary of the target that matches the host with `--version` and refuses a value that is not the pinned one. That last check is
what protects `verifyInstalledRuntime`, which compares the installed version for exact equality. The
script prints the block for review instead of rewriting the lock, so paste it over the `opencode`
entry and re-run it with that exact version: the command reports `already pins OpenCode <version>`
when the committed block matches byte for byte.

Run it on a version bump only. A bump also needs the Windows checks in
[the OpenCode notes](architecture/providers.md#opencode-and-acp): the `win32-x64` values come from the
published tarball read on macOS, so a staged `opencode.exe --version` must be confirmed on Windows
before release.

## Pin the Computer Use driver

`native-runtime.lock.json` pins `cua-driver`, the third-party binary that gives every provider
Computer Use, by release tag, asset SHA-256, and one SHA-256 for each file estack ships. Unlike the
provider CLIs, the driver is packaged rather than downloaded on demand, so the release carries it and
the user installs nothing.

```bash
bun run pin:cua-driver 0.34.0
```

The script downloads all four `-binary` release assets, hashes each shipped file, and refuses a
release that renamed an asset or dropped a file. It prints the block for review instead of rewriting
the lock, so paste it over the `cuaDriver` entry. Use the versioned `cua-driver-rs-v*` tags; the
`nightly-cua-driver-rs-v*` tags are rebuilt daily and are not a pin.

`bun run prepare:cua-driver` then writes `build/cua-driver/<platform>/<arch>` from the pin, verifying
every digest before and after it installs, and `electron-builder.yml` copies that directory to
`resources/cua-driver/<platform>/<arch>`. Every `package`, `package:*`, `dist:*` and `dist:release`
run does this first. Each installer carries only its own target's driver, and the package verifiers
check both that the driver is present and that no other platform's is. The macOS release job calls
`electron-builder` directly rather than through `dist:mac`, so it installs the driver in its own
`Install and verify native runtimes` step; the Windows and Linux jobs get it from `dist:win` and
`dist:linux`.

On macOS the driver arrives signed by Cua AI with the hardened runtime, a secure timestamp, and the
Automation entitlement. `mac.signIgnore` keeps that signature: re-signing it under estack's
inherited entitlements would drop the entitlement and break the driver's Automation route.
Notarization accepts a nested binary signed by another Developer ID team, and
`verify-macos-package.ts` fails if the Cua AI authority or the hardened runtime flag is ever lost.

## Pin the Bun tool runtime

`native-runtime.lock.json` also pins Bun, which is not a provider CLI: it is the runtime a STDIO MCP
server is started with on a computer that has no Node, and the staged layout puts a second name
`bunx` beside it so that `npx -y <package>` has something to answer it. The pin has its own script
for the same reason OpenCode does - the version, five platform packages, and the MIT license have
to agree:

```bash
bun run pin:bun-runtime         # the newest published release
bun run pin:bun-runtime 1.4.2   # one exact version
```

It works like the OpenCode script: it downloads all five platform tarballs, checks
`package/package.json` against the registry metadata, hashes the extracted binary and
`LICENSE.md`, runs `--version` on the target that matches the host, and prints the block for review
instead of rewriting the lock. Paste it over the `bun` entry and re-run it with that exact version
to get `already pins Bun <version>`.

The x64 entries are the `baseline` builds. Bun's plain x64 build needs AVX2 and answers a spawn on
an older machine with an illegal instruction and no message, which would reach the user as an MCP
server that never starts.

Move this pin at release preparation, with the release-upgrade-safety audit, and not on a schedule:
a pinned runtime is estack's supply chain, and a Bun security release only reaches users through an
estack release. One reviewed commit per release.

## Release notes

`CHANGELOG.md` is the text of the `/changelog` page on the public site. Each pull request writes its
notes in its own file, `changelog.d/<branch>.md` with `-` for `/`, so two pull requests never change
the same lines. The version bump moves the items of every file into `CHANGELOG.md`, in the order
that the pull requests merged, and deletes the files. Items that are still under `## [Unreleased]`
in `CHANGELOG.md` go first.

- Put each change that a user can see in the file, in one of these groups:
  `### Added`, `### Changed`, `### Deprecated`, `### Removed`, `### Fixed`, `### Security`.
- Write one `- ` item for each change, for a user and not for a developer. Say what changed. For a
  fix, say what happened before.
- Write a step that the user must do after the upgrade as a bold sentence that ends with a full
  stop, for example `**Sign in again after you upgrade.**`. The page shows these items under "Action
  needed after you upgrade". Do not use bold for other sentences.

The iPhone app has its own versions and its own notes, in the Mobile tab of `/changelog`. Write the
notes of a change to the iPhone app in `apps/mobile/changelog.d/<branch>.md`, with the same rules.
A change to the desktop app or the web client and the iPhone app gets one file in each folder.
`bun run mobile:release:patch`, `mobile:release:minor` and `mobile:release:major` move these files
into `apps/mobile/CHANGELOG.md` and set the version in `apps/mobile/app.json`,
`apps/mobile/package.json` and the copy of it in `bun.lock`. The pre-commit hook checks the new section when a commit changes the
`app.json` version. The new section is `## [x.y.z] - In review`, and `/changelog` does not show it
until a store makes the build available. Each store reviews the build on its own. When one store has
it, `bun run mobile:release:published ios` (or `android`) writes the date of that store, such as
`## [x.y.z] - 2026-10-14 (Android)`. Run it again for the other store:
`## [x.y.z] - 2026-10-14 (Android), 2026-10-16 (iOS)`. A date with no store is the date of both
stores. `/changelog` shows each store, and a store that does not have the version as "In review".
A store that a newer version replaced is `Skipped (Android)`, and `/changelog` shows it as skipped.
`bun run mobile:release` does each step from a menu and opens the pull request
(`apps/mobile/README.md#release-menu`).

A fix with no native change can go to the phones of a store version with no store review, as an
over-the-air update: `bun run mobile:ota:publish`. Its notes get a section with a fourth number, such
as `1.5.0.1`, from `bun run mobile:release:ota`; the store version and `app.json` do not change. The
steps, the limits and the rollback are in
[the mobile README](../apps/mobile/README.md#over-the-air-updates).

The same step sets that version for the store in `MOBILE_LATEST_VERSIONS` and in the `upTo` of each
feature in `apps/auth-api/src/server/mobile-features-config.ts`. The merge deploys the account
service. An app with an older version then shows the update header on home. Set it only after the
store has the build: before, Update opens a store page that cannot install the version.

The Android version in `MOBILE_LATEST_VERSIONS` is also the version of the APK that estack.invalid
offers for a phone with no Google Play. The APK of a store build is a draft GitHub release, which is
not public. The merge of this step makes it public (the `Publish the Android APK` workflow), before
the account service deploys. That workflow fails when the version has no draft
`android-v<version>`: see [Android APK](../apps/mobile/README.md#android-apk).

`scripts/check-release-notes.ts` stops a release when the section is missing, empty or appears two
times, or when it has an unknown group, a group with no items, an item with no text or outside a
group, a placeholder such as `TODO`, or a heading with no real date. These steps run it:

- `bun run release:patch`, `release:minor` and `release:major` check the new section before they
  write it. They stop, and delete no file, when a line is not in an item.
- The pre-commit hook checks each staged `changelog.d` file with `--fragments`, and the staged
  `CHANGELOG.md` when a commit changes the `package.json` version.
- The `Changelog` workflow checks each `changelog.d` file. It fails a pull request that adds no
  `changelog.d` file and does not change `CHANGELOG.md`, unless the pull request has the
  `no-changelog` label. Use the label when a user sees no change.
- `bun run release:preflight` and the tag workflow check the section of the `package.json` version.

### Post-update notes

The desktop dialog uses edited excerpts of the published `CHANGELOG.md` in
`src/renderer/src/features/updates/whats-new-releases.json`. Before publishing a desktop release,
add its version, date, and selected notes there. Keep earlier entries for users who skip releases.
Use short, plain sentences that explain what the user can do. Put required upgrade steps in
`notices`. Use `added`, `changed`, and `fixed` for the other entries. Do not copy commit messages,
developer setup, internal paths, credentials, or unpublished plans. Review this text with the
release notes before tagging. A release can have no dialog entry when it has nothing to show.

The dialog shows the notes in the app language. Each translated language has
`src/renderer/src/features/updates/whats-new/<locale>.json` in the shape of the English file. When
you add a release to the English file, add its translation to each of these files: the same version
and date, the same notices, groups and item order, and one item for each English item. Write the
first sentence of each item as its headline, as in English; Chinese and Japanese end it with `。`.
Use the tone, the terms, and the screen names of the app catalogs in [i18n.md](i18n.md#terms).
An agent gives these translations to small-model subagents, as the
[release-upgrade-safety skill](../.agents/skills/release-upgrade-safety/SKILL.md#subagents-and-models) says.
`bun scripts/whats-new-translations.ts <version>` checks the files; `release:preflight` and the
tag workflow run it and stop a release that has no translation. A release that a file does not
have shows in English, so an older release that was never translated keeps its English text.

The app bundles this text and loads it when needed, so reading it does not send data or require
network access. The full changelog button opens the existing public page. Changing the bundled
text requires a new app release. Missing entries do not cause a network fallback.

The installed desktop version comes from `AppInfo`, not an available update or a remote server.
In development, `AppInfo` uses `package.json`; Electron otherwise reports its own version.
The local app profile keeps the highest consumed version in `estack:whats-new-version`. On the
first launch of this feature, an existing `estack:analytics-app-version` can supply the previous
version; the dialog does not enable analytics. A profile with no previous version gets a silent
baseline, so onboarding is not covered by release notes. Stable `x.y.z` releases participate;
unknown versions and prerelease builds do not advance the marker. Downgrades do not lower it.
The marker is saved before automatic display, including a load error; Settings > Updates can
open the notes again. Empty updates are consumed without opening. If the marker cannot be saved,
automatic display is disabled; manual opening still works.

Mobile has its own store version and `apps/mobile/CHANGELOG.md`. It must use a native screen and
its own local marker when post-update notes are added there. Desktop notes must not use a mobile
version or the version of a connected server. This desktop feature does not change mobile,
public web, Signal, database schemas, or Team API contracts.

### Discord announcement

Each desktop release posts a message in the estack Discord. Before publishing a desktop release,
select the 3 to 5 changes in its `CHANGELOG.md` section that have the largest effect on users, and
write them with the version in `.github/release-announcement.json`:

```json
{ "version": "x.y.z", "highlights": ["...", "...", "..."] }
```

Write each highlight as one short, plain sentence that tells the user what they can do now. Put a
required upgrade step first. Use the rules of the post-update notes: do not copy commit messages,
developer setup, internal paths, credentials, or unpublished plans. Replace the highlights of the
previous release; the file holds only one version.

`scripts/discord-release-announcement.ts` builds the message: a mention of the `Release Pings`
role, the title `estack vx.y.z is out`, the highlights, and a link to the version on `/changelog`.
It notifies only that role, not `@everyone` or `@here`. Run
`bun scripts/discord-release-announcement.ts check x.y.z` to see it. The tag workflow and
`bun run release:preflight` stop when the file is not for the release version, has fewer than 3 or
more than 5 highlights, has a highlight that is empty or has a placeholder, a line break or a
mention, or makes a message longer than 2000 characters. They also stop when the
`DISCORD_RELEASE_ROLE_ID` repository variable is not set or is not a Discord role ID. After the GitHub Release, the Docker image and the
boat snapshot are published, the `discord-announce` job posts the message as estack through the
channel webhook in the `DISCORD_RELEASE_WEBHOOK_URL` secret of the `release` environment. The job
fails, and posts nothing, when `DISCORD_RELEASE_ROLE_ID` is not set. A failed post does not undo the
release: re-run the job. A re-run after a successful post posts the message again.

One-time setup:

1. In Discord, open the settings of the announcement channel, then Integrations > Webhooks. Make a
   webhook named `estack` with the estack icon. Add its URL as the secret
   `DISCORD_RELEASE_WEBHOOK_URL` of the `release` environment.
2. In Discord, turn on Developer Mode, open Server Settings > Roles, right-click `Release Pings` and
   select Copy Role ID. Add the ID as the repository variable `DISCORD_RELEASE_ROLE_ID`.

The mobile app has its own post, file, webhook and workflow. It waits until both stores have the
version. See [the mobile Discord announcement](../apps/mobile/README.md#discord-announcement).

## Publish a version

Start from a clean, up-to-date `main` branch. For the first release, `package.json` and
`CHANGELOG.md` are already prepared as `0.1.0`; after the checks pass, create its annotated tag
directly:

```bash
git tag -a v0.1.0 -m "estack v0.1.0"
git push origin v0.1.0
```

For later releases, the release notes are in `changelog.d/`. Choose the appropriate semantic version
bump:

```bash
bun run release:patch
# or: bun run release:minor
# or: bun run release:major
```

The command updates `package.json`, moves the `changelog.d` items and the items under `Unreleased`
under the new dated version heading, and deletes the `changelog.d` files. Review and publish that
preparation before creating the tag:

```bash
git add package.json CHANGELOG.md changelog.d .github/release-announcement.json
git commit -m "release: prepare vX.Y.Z"
git push origin main
bun run release:preflight
git tag -a vX.Y.Z -m "estack vX.Y.Z"
# When Signal changed since the previous tag, deploy and check Signal from
# vX.Y.Z now (preflight item 7). Push the tag only after that.
git push origin vX.Y.Z
```

A tag marks a stable point; nothing is built from it. Before the tag, audit the changes since the
last released tag with the `.agents/skills/release-upgrade-safety/` skill, and run the preflight
checklist below.

## Minimum app version

Each surface has a minimum app version: the desktop app, the server, iOS and Android. A version below
it shows **Update required**. The web client has no minimum: the Worker serves it, so it is always
current. The values are in `APP_MINIMUM_VERSIONS` (`apps/auth-api/src/server/app-minimum-version.ts`).
They are `null` (nothing blocked) until we raise one.

To raise a minimum:

1. Raise it only in a PR that deletes old code or needs the newer client. The support window is 2
   months (see [Team API support window](../AGENTS.md#non-negotiable)).
2. Set the value to a released version that is 60 days old or older: the date in `CHANGELOG.md` for
   `desktop` and `host`, the store date in `apps/mobile/CHANGELOG.md` for `ios` and `android`.
   Over-the-air versions do not count.
3. `bun run check:app-minimum-version` (in the CI `Check` job) fails for a newer or unknown version.
4. The value is live when the account service Worker deploys.

How the apps use it:

- `GET /v1/app/minimum-version?surface=desktop|host|ios|android` answers `{ minimumVersion }`
  (`null` for none or an unknown surface). `GET /v1/mobile/features` has the same field for the phone
  platform.
- A packaged desktop app or server asks 15 seconds after start and every 6 hours
  (`src/main/required-update.ts`). Below the minimum, the desktop app shows **Update required** in
  place of the workspace. The update downloads and installs when the agents are idle
  (`RequestedUpdate`: agent turns, routines, browser control and transfers), or at once with the
  button. A server does the same without the screen. A tenant whose Host Manager manages updates, a
  development build and a local server child do not ask.
- A signed-in phone below the minimum shows **Update required** with the store link.
- A failed check never blocks. A failed request (offline, timeout, error status) keeps the last
  confirmed state. An answer with no readable minimum removes the block.
- An install that cannot update itself (a Linux package) shows only the download page.

## Preflight checklist

Before creating the first tag or any later one:

0. run the Team API compatibility matrix for every protocol that remains in the adapter registry. The matrix must cover an older client with the new host, the new client with an older host, matching versions, no shared protocol, capability omission, unknown optional events, and malformed known events. Do not reduce this matrix because a protocol is old or because many application versions separate the peers. Confirm that each supported protocol still has unchanged client and host fixtures;

1. run `bun run release:preflight` and resolve every reported gate that applies to what you publish;
2. run `bun install --frozen-lockfile` and `bun run check` from a clean clone;
3. confirm that the lock file contains all six provider artifacts, their download and install sizes,
   and that their install checks pass;
4. smoke-test sign-in/setup, chat streaming, queues, attachments, agent messaging, browser control,
   and context compaction;
5. confirm `CHANGELOG.md` and `.github/release-announcement.json` describe the version and the
   working tree is clean;
6. audit the changes since the last released tag with the `.agents/skills/release-upgrade-safety/`
   skill: it covers the upgrade and data-loss hazards an installed user cannot undo — the in-place
   database migration, the `userData` files nothing backs up, the frozen Team API adapters, and the
   D1 migrations that race their own deploy;
7. read the running Signal commit of your machines from their `/health/live`, not from an entry
   hostname that reaches only one machine. If a commit is missing or `unknown`, or if
   `git diff --quiet <running commit> <new tag> -- remote packages/contracts/src/signal-protocol`
   finds changes for either commit, deploy Signal from the local tag before you push the tag. Compare
   with the running commit, not with the previous tag: an earlier release can have left Signal behind.
   Use the Signal-only procedure in
   [remote-session-deployment.md](remote-session-deployment.md#deployment-procedure--requires-separate-approval);
   the `.agents/skills/signal-deploy/` skill adds the checks before and after it. Confirm that
   `/health/live` of each machine shows the tag commit;
8. create and push the version commit, and create the tag locally, only after the checks pass on
   `main`;
9. push the tag.
