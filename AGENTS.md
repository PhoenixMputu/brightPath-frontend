# AGENTS.md

Instructions for any AI agent working on this project. These rules are **mandatory**.

---

## 1. Git workflow (mandatory)

### Git identity (local to this project only)
Before the first commit, configure the identity **for this repository only**:

```bash
git config user.name "Victory Deo"
git config user.username "PhoenixMputu"
git config user.email "victory23tshimbadi@gmail.com"
```

- **Never use `--global`** (or `--system`). Never modify the machine's global Git configuration.
- Check before committing: `git config user.name` and `git config user.email` must return the values above.
- All commits are made with this identity. No other author or co-author.

### Before starting
Always create a new branch from `dev`. Never work directly on `dev` or `main`.

```bash
git checkout dev
git pull origin dev
git checkout -b <type>/<short-description>
```

Naming convention: `feat/...`, `fix/...`, `refactor/...`, `chore/...`, `docs/...`
Examples: `feat/login-otp`, `fix/sidebar-overflow`

### While working
- Small, clear commits following Conventional Commits, in English: `feat: add OTP verification form`
- **Never add `Co-Authored-By`** (or any other co-author trailer) to commit messages.
- Never sign a commit on behalf of an agent or AI tool.

### When done
1. Make sure everything passes:
   ```bash
   bun run lint
   bun run build
   ```
2. Merge into `dev`, then delete the branch:
   ```bash
   git checkout dev
   git pull origin dev
   git merge --no-ff <my-branch>
   git branch -d <my-branch>
   ```
3. If the branch was pushed to the remote, delete it there too:
   ```bash
   git push origin --delete <my-branch>
   ```
4. If there is a merge conflict: stop and ask. Do not resolve it blindly.

---

## 2. Stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui**
- **TanStack React Query**: server state (fetching, caching, mutations)
- **Zustand**: global client state
- **Zod**: validation and schemas
- **React Hook Form** (+ `@hookform/resolvers/zod`): forms
- **next-intl**: internationalization
- **next-themes**: dark mode (light / dark / system)
- **PWA**: the app must be an installable Progressive Web App (native Next.js manifest + service worker)
- **Bun**: package manager and runner. Do not use npm, yarn or pnpm.

---

## 3. Forbidden

- ❌ **Never `axios`.** Not as a direct dependency, not through a wrapper. Use native `fetch`.
- ❌ **No rewrites**: no `rewrites` in `next.config`, no `NextResponse.rewrite()` in `proxy.ts`, no route handlers (`app/api/...`) that just pass requests through to the API. Services call the API directly.
- ✅ `proxy.ts` is allowed (cookie checks, redirects).
- ❌ No `Co-Authored-By` in commits.
- ❌ No packages with known vulnerabilities.
- ❌ No `any` without a justifying comment.

---

## 4. Installing packages

After **every** package installation, immediately run:

```bash
bun audit
```

- If `bun audit` reports a vulnerability (at any severity): uninstall the package (`bun remove <package>`), try a patched version or an alternative, then run `bun audit` again.
- Never commit a `bun.lock` that contains a vulnerable package.
- Before adding a dependency, check that it is truly needed and not already in the project.
- shadcn components: add them with `bunx shadcn@latest add <component>`.

---

## 5. Project structure

```
messages/              # next-intl translations (en.json, fr.json, ...)
public/
├── sw.js              # Service worker
└── icons/             # PWA icons (192x192, 512x512, maskable)
src/
├── i18n/
│   └── request.ts     # next-intl config (locale resolution)
├── app/
│   ├── manifest.ts    # Web app manifest
│   ├── (protected)/   # Protected pages (access via session cookies)
│   └── (public)/      # Pages accessible without login (login, verify-otp, ...)
├── components/
│   ├── shared/        # Components reusable anywhere in the project
│   ├── ui/            # shadcn components (generated, edit sparingly)
│   └── layout/        # Structural components (header, sidebar, shells, ...)
├── hooks/             # Custom hooks (React Query, ...)
├── lib/               # Helpers, utilities
├── schemas/           # Zod schemas
├── stores/            # Zustand stores
├── services/          # Direct API calls (fetch)
└── types/             # TypeScript types and interfaces
```

### Where things go

| Need | Folder |
|---|---|
| HTTP call to the API | `services/` |
| `useQuery` / `useMutation` that calls a service | `hooks/` |
| Form or API response validation | `schemas/` |
| Global client state (UI, client session, ...) | `stores/` |
| Reusable pure function (formatting, dates, `cn`, fetch client) | `lib/` |
| Shared type or interface | `types/` |
| Component used across several pages | `components/shared/` |
| Component used by a single page | next to that page, in `app/` |

### Data flow

```
Component → hook (hooks/) → service (services/) → fetch → API
                ↑
        Zod schema (schemas/) to validate inputs/outputs
```

- Components **never** call `fetch` directly: they go through a hook.
- Hooks **never** call `fetch` directly: they go through a service.
- Services contain no React logic.

---

## 6. Code conventions

### Services (`services/`)
- Use a small centralized `fetch` client in `lib/` (base URL, headers, error handling, `credentials: "include"` for cookies).
- One function per endpoint, typed for both input and output.
- Throw a clear error when `response.ok` is false.

### Hooks (`hooks/`)
- Naming: `useXxx` (e.g. `useUser`, `useLoginMutation`).
- Centralize query keys (e.g. `lib/query-keys.ts`) instead of hardcoding them.
- Invalidate the relevant queries after a mutation.

### Forms
- Always `react-hook-form` + `zodResolver` + a schema from `schemas/`.
- Use shadcn's `Form` components.
- Infer types with `z.infer<typeof schema>` instead of duplicating them.

### Stores (`stores/`)
- One store per domain (e.g. `auth-store.ts`, `ui-store.ts`).
- Do not store server data in Zustand: that is React Query's job.

### Protected pages
- Protection is handled in `proxy.ts`: read the cookies and `NextResponse.redirect()` to `/login` when there is no session. Never `NextResponse.rewrite()`.
- Keep a server-side check in `app/(protected)/layout.tsx` for sensitive data (the proxy must not be the only barrier).

### Components
- Server Components by default; `"use client"` only when needed (state, effects, events, hooks).
- Style with Tailwind only; use `cn()` for conditional classes.
- Files in `kebab-case.tsx`, components in `PascalCase`.

### Language
- **All code is in English**: variable, function, component, file and type names, comments, commit messages, branch names.
- User-facing text is never hardcoded: it goes through next-intl (see below).

### Internationalization (next-intl)
- Use next-intl **without i18n routing**: no `[locale]` segment in `app/`, no next-intl `createMiddleware` (it performs rewrites, which are forbidden).
- The locale is read from a cookie (e.g. `NEXT_LOCALE`) in `src/i18n/request.ts`, with a default locale as fallback.
- All translations live in `messages/<locale>.json`, organized by namespace (e.g. `auth`, `dashboard`, `common`). Keys are in English and `camelCase`.
- Server Components: `getTranslations`. Client Components: `useTranslations`.
- Every new key must be added to **all** files in `messages/`.
- Zod error messages shown to the user must be translated too.

### Dark mode (next-themes)
- next-themes `ThemeProvider` with `attribute="class"`, `defaultTheme="system"` and `enableSystem`, placed in a provider component in `components/layout/`.
- Add `suppressHydrationWarning` to the `<html>` tag in the root layout.
- Switch themes only through next-themes' `useTheme()`. Do not store the theme in Zustand or manually in `localStorage`.
- Dark styles use Tailwind `dark:` variants and shadcn CSS variables. No hardcoded colors that break in dark mode.
- Render the theme switcher only after client-side mount, to avoid hydration errors.

### PWA
- The app must stay installable as a PWA at all times. Do not break the manifest, icons or service worker.
- Manifest in `src/app/manifest.ts` (typed with `MetadataRoute.Manifest`): `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, and icons (192x192, 512x512, plus a `maskable` icon) in `public/icons/`.
- Service worker in `public/sw.js`, registered from a small client component in `components/layout/` (only in production, and only if `"serviceWorker" in navigator`).
- Do not use `next-pwa` (unmaintained). Any PWA library must pass `bun audit` and be approved before being added.
- In `next.config`, `headers()` may be used for `sw.js` (`Cache-Control: no-cache, no-store, must-revalidate` and a correct `Content-Type`). Headers are allowed; rewrites are still forbidden.
- `proxy.ts` must exclude PWA assets from its `matcher`: `sw.js`, `manifest.webmanifest`, `icons/`, and static files. Otherwise they get redirected to `/login` and installation breaks.
- Caching rules in the service worker:
   - Static assets (`/_next/static/`, icons, fonts): cache-first.
   - Page navigations: network-first, with an offline fallback page.
   - **Never cache API responses or protected pages that contain user data.**
   - Version the cache name and delete old caches on `activate`.
- `theme_color` must match the app's theme. Use `viewport.themeColor` in the root layout, with a value for light mode and one for dark mode.
- The offline page text goes through next-intl like any other user-facing text.

### TypeScript
- Strict mode. No `any`; prefer `unknown` and narrow it.
- Imports use the `@/` alias (e.g. `@/services/auth`).

---

## 7. Checklist before merging into `dev`

- [ ] Git identity is configured locally (without `--global`) with the project values
- [ ] I am on a dedicated branch created from `dev`
- [ ] No `axios` import, no Next.js rewrites (`next.config`, `proxy.ts` or pass-through route handler)
- [ ] Code, comments and commits are in English
- [ ] No hardcoded user-facing text: every key exists in each `messages/*.json` file
- [ ] The UI has been checked in both light and dark mode
- [ ] The app is still installable as a PWA (manifest valid, service worker registered, PWA assets not blocked by `proxy.ts`)
- [ ] No API responses or protected user data are cached by the service worker
- [ ] `bun audit` passes with no vulnerabilities
- [ ] `bun run lint` and `bun run build` pass
- [ ] No `Co-Authored-By` in commits
- [ ] Merged into `dev`, branch deleted (local and remote)