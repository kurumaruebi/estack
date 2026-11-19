### Removed

- The home page laser beam is gone. Its animation is a port whose license does not allow a public copy, so the page shows the hero as it did after the beam, and the repository references no private component.
- The contributor agreement and commercial license pages are removed from the account service site, together with their routes and footer links. The terms, the DPA and the privacy policy now name "the operator of this estack account service" instead of a specific company, and commercial licensing points at the copyright owner named in the repository's NOTICE.

### Changed

- The built-in GitHub connection is off until the operator makes their own GitHub App: `bun scripts/create-github-app.ts` prints the Client ID, and `ESTACK_GITHUB_CLIENT_ID` turns the connection on. No upstream App is used by default.
