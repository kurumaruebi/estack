# Security Policy

## Supported versions

estack develops on `main`; a `v0.x.y` tag marks a stable point that a self-hosted server or script
can pin to. Security fixes land on `main` first and reach the next tag. No older release line is
guaranteed to receive backports.

| Version | Supported |
| --- | --- |
| `main` / latest release | Yes |
| Older releases | No guaranteed backports |

## Reporting a vulnerability

Do not open a public issue. Use GitHub's **Security → Report a vulnerability** flow to submit a private
security advisory. If private vulnerability reporting is unavailable, contact the maintainer through
[their GitHub profile](https://github.com/kurumaruebi) without publishing technical details.

Include:

- the affected version or commit;
- impact and realistic attack scenario;
- minimal reproduction steps or a proof of concept;
- whether sensitive data may already have been exposed;
- suggested remediation, if known.

Remove unrelated credentials, tokens, personal data, conversations, and private files. You should
receive an acknowledgement within seven days. Please allow a reasonable remediation window before
public disclosure.

## Current security model

estack is local-first but not sandboxed from the host on behalf of the user. Agents currently run with
`danger-full-access` and `approvalPolicy: never`; they may access local files, execute commands, use
the network, and control the embedded browser. This documented behavior alone is not a vulnerability.

Security boundaries that should hold include:

- remote pages cannot access Node.js, the preload bridge, managed attachments, or privileged IPC;
- IPC calls are accepted only from the trusted application renderer;
- managed attachment IDs cannot escape their canonical storage roots;
- Codex and Claude credentials remain owned by their CLIs and are not copied into estack storage;
- diagnostics do not expose tokens or raw sensitive stderr;
- a browser tab is scoped to its owning agent/thread in the application UI.

Reports showing a bypass of those boundaries are welcome.
