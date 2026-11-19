# Contributing to estack

estack is a personal, noncommercial project. The source is public so that you can read it, run your
own server, and build your own apps from it. Outside pull requests are not accepted for now: open an
issue instead, and a maintainer decides.

## Before opening an issue

- Use an issue form, and search existing issues first.
- Use the security process in `SECURITY.md` for vulnerabilities.
- Remove credentials, private file paths, conversation contents, and personal data from diagnostics.
- For a bug, give the platform, the estack version, the operating system, the provider and its CLI
  version, the exact steps, and the expected and actual results. The bug form asks for each one.
- Use Discussions for questions and for ideas that are not yet a specific request, when the project
  has them enabled.

## Development setup

```bash
git clone https://github.com/kurumaruebi/estack.git
cd estack
bun install --frozen-lockfile
bun run check
bun run dev
```

Coding agents skip `bun run check`: see [AGENTS.md, Checks](AGENTS.md#checks).

The supported toolchain is pinned in `package.json`. Use stable Bun 1.4.2, TypeScript 7, Vite 7, and the
existing Biome configuration. Biome is the only lint and format tool. Do not add a second linter,
Prettier, a second state library, or a UI kit without first discussing the architectural cost.
The Biome configuration also loads the repository-owned GritQL rules in
`tools/biome/anti-slop/rules`. Fix these findings at the domain boundary. Do not suppress a rule or
replace a concrete contract with a broad dictionary type.

Biome's `suspicious/noImportCycles` rejects circular imports across the whole repository, so runtime
imports point in one direction. When two modules need each other, move the shared piece into a third
module both can import — as `features/conversation/conversation-controller-context.tsx` does for the
conversation controller, and `features/team/team-typing.ts` for the one IPC call two differently
scoped owners both need.
Type-only imports (`import type`) are erased by the compiler and stay allowed in both directions.

## Security-sensitive changes

Preserve the following boundaries, and their tests where they exist:

- Electron sandboxing, context isolation, navigation policy, and IPC sender validation.
- Attachment realpath, MIME, size, quota, and managed-protocol checks.
- Queue serialization, idempotency, crash reconciliation, and atomic persistence.
- The browser tabs' page preload (`src/preload/browser-page.ts`): it only changes page values in the
  page world. It has no IPC and exposes no world, so a page gets no `window.estack` and no path to
  main. `scripts/verify-preload-bundle.ts` checks this.
- Secret redaction and agent child-process cleanup.

Full agent access is intentional today, but new privileges or network surfaces still require an
explicit threat-model note in the pull request.

## Writing guides

Public guides live in `apps/auth-api/src/content/guides/`. To add one:

1. Write the body as a TSX component in that directory, using the article slug for the file name.
2. Add the article metadata to `apps/auth-api/src/lib/guides.ts` and the body to
   `apps/auth-api/src/content/guides/index.ts`.
3. Run `bun run api:images` and commit the generated files in `apps/auth-api/content-art`.
4. Open the guide in a local preview and check the guide index, article page, feed and social card.

Write for someone who has estack open and is trying to complete a task. Use short paragraphs, plain English and the
exact names of buttons, settings and files. Keep product claims tied to the current app. Use `ArticleImage` only
when the picture adds information that the text does not.

Use `ESTACK_LINKS` for external links and include useful `alt` text for every image. Do not paste bare URLs into a
guide.

## Translations

English is the source text. A French or Japanese catalog can be partial: a key it does not have
shows in English. To add a key, a translation or a language, follow [docs/i18n.md](docs/i18n.md) and
run `bun run i18n:check`.

## Dependencies

Prefer the platform and existing dependencies. A new runtime dependency should remove more
complexity than it adds, have a compatible open-source license, and be justified in the pull request.

Bun does not resolve a version that is less than 3 days old (`minimumReleaseAge` in `bunfig.toml`),
and Dependabot waits the same time. Only the packages in `trustedDependencies` in `package.json` can
run install scripts. If a new dependency needs its install script, add it to that list and give the
reason in the `bunfig.toml` comment. `bun pm untrusted` shows the blocked scripts.

## Licensing

estack is licensed under the PolyForm Noncommercial License 1.0.0. See [LICENSE](LICENSE) and
[NOTICE](NOTICE) for the required attribution and third-party notices. Outside contributions are not
accepted for now, so no contributor agreement exists.
