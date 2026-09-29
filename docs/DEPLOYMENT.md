# Deployment: GitHub Pages + jpamies.com

The site deploys automatically with [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

```
push to master/main ─► npm test ─► npm run build ─► upload dist/ ─► deploy-pages (OIDC)
pull request        ─► npm test ─► npm run build            (no deploy)
```

No secrets are required: `actions/deploy-pages` authenticates with the short-lived OIDC token GitHub
issues to the `deploy` job.

## 1. One-time repository settings

1. **Settings → Pages → Build and deployment → Source: `GitHub Actions`**
   (the old "Deploy from a branch" Jekyll mode must be switched off).
2. **Settings → Pages → Custom domain:** `jpamies.com` → *Save*.
3. Once the certificate is issued (can take up to ~1 h): tick **Enforce HTTPS**.
4. **Settings → Environments → `github-pages`** (created on first deploy): keep the
   *Deployment branches* rule limited to the default branch.
5. Recommended: **Settings → Code security** → enable *Private vulnerability reporting*,
   *Dependabot alerts/security updates*, *Secret scanning* and *Push protection*.
6. Recommended: a branch protection/ruleset on `master` requiring the *Test & build* check.

> With a custom Actions workflow GitHub ignores the `CNAME` file for configuration — the domain lives in
> the Pages settings. `site/CNAME` is kept as documentation and for tools that expect it.

## 2. Verify the domain (prevents domain takeover)

**GitHub → your avatar → Settings → Pages → Add a domain → `jpamies.com`**. GitHub shows a TXT record:

| Type | Name | Value |
|---|---|---|
| TXT | `_github-pages-challenge-jpamies` | *(value shown by GitHub)* |

Add it in DNS, click **Verify**, and keep the record.

## 3. DNS records (Cloudflare, zone `jpamies.com`)

Apex → GitHub Pages:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `jpamies.github.io` | DNS only |

- `www.jpamies.com` is redirected by GitHub to the apex automatically.
- Keep the records **DNS only (grey cloud)** at least until GitHub has issued the Let's Encrypt
  certificate. If you later enable the Cloudflare proxy, set SSL/TLS mode to **Full (strict)**.
- Existing sub-domains (`fantasy.jpamies.com`, `stickers.laliga.jpamies.com`, …) are unaffected.
- Remove any old record that pointed the apex or `www` elsewhere.

Check propagation:

```bash
dig +short jpamies.com A
dig +short www.jpamies.com CNAME
curl -sI https://jpamies.com | head -n 1
```

## 4. Other `*.github.io` projects

Project sites such as `jpamies.github.io/pokemon/` will automatically be served from
`https://jpamies.com/pokemon/` once the user site has the custom domain. Avoid creating a
`site/pokemon/` folder here, or it would shadow that project.

## Rollback

Re-run a previous successful *Build & deploy* workflow run (**Actions → run → Re-run all jobs**), or
`git revert` the offending commit and push.
