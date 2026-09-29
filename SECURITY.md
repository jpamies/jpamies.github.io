# Security Policy

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's
[private vulnerability reporting](https://github.com/jpamies/jpamies.github.io/security/advisories/new)
for this repository. You'll get an answer as soon as possible.

## Security model

This is a static site served by GitHub Pages. There is no backend, no database, no login and no user
input is ever sent anywhere.

| Area | Measure |
|---|---|
| Secrets | The repository contains **no secrets** and needs none. Deployment uses GitHub's OIDC token (`id-token: write`) scoped to the `deploy` job. `.env*` files are git-ignored and the build **refuses to publish any dotfile**. Every push is scanned with **gitleaks**. |
| Supply chain | **Zero npm dependencies** at runtime and build time. All GitHub Actions are **pinned to full commit SHAs** and kept up to date by Dependabot. |
| Workflow permissions | Top-level `contents: read`; only the deploy job gets `pages: write` + `id-token: write`. `persist-credentials: false` on checkout. |
| Code scanning | CodeQL (`security-extended`) for JavaScript and GitHub Actions on every push, PR and weekly. |
| XSS | All dynamic HTML goes through `esc()` in `site/js/ui/templates.js` (unit-tested). |
| Content Security Policy | `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `connect-src 'self'`. No `unsafe-inline`/`unsafe-eval`. The only inline `<script>` is the non-executable JSON-LD data block. |
| Privacy | No cookies, no analytics, no third-party fonts/CDNs. Game progress is stored only in the visitor's `localStorage` (`cloudquest.v1`) and validated on load. |
| Links | External links use `rel="noopener noreferrer"`; referrer policy `strict-origin-when-cross-origin`. |
| Domain | Custom domain verified at account level to prevent takeover; HTTPS enforced (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)). |

### Known platform limitations

GitHub Pages does not allow custom response headers, so `frame-ancestors`, HSTS preload and
`Permissions-Policy` cannot be set from the repository. If they become required, put a CDN/proxy
(e.g. Cloudflare with "Transform Rules") in front of Pages.
