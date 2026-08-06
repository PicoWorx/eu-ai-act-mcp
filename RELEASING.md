# Releasing this server

Written 2026-07-27 after the 1.4.0 release, where the version was bumped in one
place and the live server kept announcing the old one for half a day.

## The version lives in ONE place now. Keep it that way.

`package.json` is the source of truth. `src/constants.ts` exports `SERVER_VERSION`,
read from it at runtime, and both consumers import that constant.

It used to live in three places, which is how it drifted:

| Where | What it feeds | Symptom when stale |
|---|---|---|
| `package.json` | the npm package | `npm view ... version` is behind |
| `src/server.ts`, MCP handshake | what CLIENTS display | Smithery shows the old version while serving new code |
| `src/http.ts`, `/health` | uptime checks and humans | `/health` disagrees with the package |

If you ever add a fourth place, you have reintroduced the bug. Check with:

```bash
grep -rn '"[0-9]\+\.[0-9]\+\.[0-9]\+"' src/ | grep -v package.json
```

That should return nothing.

## Deployment topology, because the three paths are independent

- **Railway** builds from the `Dockerfile`, which copies `src/` and runs
  `npm run build`. It never uses committed build output. Pushing to `main` is
  what updates it. It serves **https://mcp.lexbeam.com**.
- **Smithery** serves the Railway deployment, so the version it shows comes from
  the MCP initialize handshake, not from npm. It updates when Railway restarts.
  Listing: https://smithery.ai/servers/lexbeam-software/eu-ai-act
- **npm** is a separate path used by anyone running `npx @lexbeam-software/eu-ai-act-mcp`.
  It only updates when you publish, and it is easy to forget precisely because
  Railway and Smithery look correct without it. Publishing needs `npm login`,
  which lives on one machine only, so a release started elsewhere stops here.

Pushing to main fixes the hosted path. It does nothing for npm consumers.

## Verifying a release actually landed

A version bump proves nothing; check the payload, not the number.

```bash
# 1. hosted version, usually current within a minute or two of the push
curl -s https://mcp.lexbeam.com/health
# {"status":"ok","server":"lexbeam-eu-ai-act-mcp","version":"1.4.3"}

# 2. the content itself, which is the check that matters
curl -s -X POST https://mcp.lexbeam.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"euaiact_check_deadlines","arguments":{}}}'

# 3. npm, the path that silently stays behind
npm view @lexbeam-software/eu-ai-act-mcp version
```

Note that `/` returns 404; only `/health` and `/mcp` are served.

## `dist/` is not tracked

`.gitignore` has always listed `dist/`, but 120 compiled files were committed
before that line existed and stayed tracked, leaving a partial build in git that
crashed a fresh clone with `ERR_MODULE_NOT_FOUND`. They were untracked in
`f00ab45`. Do not commit `dist/` again.

`prepublishOnly` runs the build before `npm publish`, so the published package is
always compiled from source. Do NOT use `prepare` for this: it runs during
`npm install`, and the Dockerfile runs `npm ci` before copying `tsconfig.json`
and `src/`, so the build would fail and take the deployment with it.

## Tracking beats ignoring

`.gitignore` only filters files git is not already tracking. Once a file is tracked, git
never consults the ignore rules for it again, so a path can sit in `.gitignore` and be
committed at the same time. This repo hit it twice:

- `dist/` - 120 compiled files, untracked in `f00ab45`.
- `node_modules/` - 3,714 files, roughly 69 MB including a platform-specific `esbuild`
  binary. Every clone dragged them down, and `npm ci` then rewrote the directory, so git
  reported thousands of changes to a path it was told to ignore.

`git status` will not warn you, because it stays quiet about tracked, unmodified files, and
`git check-ignore` reports nothing for a tracked file by design. The only reliable check:

```bash
git ls-files node_modules dist | head    # must be empty
```

The cure is `git rm -r --cached <path>`, which drops it from the index and leaves it on
disk. Note this cleans the current tree, not history, so old clones stay large until the
history is rewritten.

## Checklist

0. `git ls-files node_modules dist` must return nothing.
1. Bump the version in `package.json` and `smithery.yaml`.
2. `npm run build && node test.mjs` - the suite must be fully green.
3. Add a CHANGELOG entry, including anything left unresolved.
4. Commit, push to `main`, wait for the Railway build.
5. `curl https://mcp.lexbeam.com/health` and confirm the version matches.
6. `npm publish` if npx consumers should get it, then confirm with
   `npm view @lexbeam-software/eu-ai-act-mcp version`.

## When the legal content changes

A legal amendment is a content pass, not a date edit. Flipping the enactment
record alone left the obligations data, the summary key-changes list, the source
registry, several FAQ answers, the Art. 113 summary and the prohibited-practices
data all stating superseded law. The cross-tool consistency test now catches the
worst class of that, where two tools report different application dates for the
same system, but it cannot catch stale prose. Grep for the superseded dates
before shipping.
