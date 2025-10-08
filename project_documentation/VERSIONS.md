# Package Versions

Current versions of key dependencies in the project.

## Backend (Cloudflare Workers)

### Core Dependencies
- **Hono**: ^4.6.15 (Web framework)
- **@supabase/supabase-js**: ^2.47.10 (Database client)

### Dev Dependencies
- **Wrangler**: ^4.42.0 (Cloudflare CLI - **Updated 2025-10-07**)
- **TypeScript**: ^5.7.3
- **@cloudflare/workers-types**: ^4.20250104.0

### Runtime
- Node.js: 18+
- Cloudflare Workers runtime

---

## Frontend (SvelteKit)

### Core Dependencies
- **Svelte**: ^5.39.10 (UI framework - Svelte 5 with runes)
- **@sveltejs/kit**: ^2.46.2 (App framework)
- **@sveltejs/adapter-cloudflare**: ^7.2.4 (Cloudflare Pages adapter)

### Dev Dependencies
- **Vite**: ^7.1.9 (Build tool)
- **TypeScript**: ^5.9.3
- **svelte-check**: Latest (Type checking)
- **@sveltejs/vite-plugin-svelte**: Latest

### Runtime
- Node.js: 18+
- Cloudflare Pages runtime

---

## Update Policy

### Regular Updates
Check for updates monthly:
```bash
# Backend
cd backend
npm outdated
npm update

# Frontend
cd frontend
npm outdated
npm update
```

### Security Updates
Apply security patches immediately:
```bash
npm audit
npm audit fix
```

### Breaking Changes
- Review changelogs before major version updates
- Test thoroughly in development before deploying
- Update documentation after major changes

---

## Recent Updates

### 2025-10-07
- **Wrangler**: 3.114.15 → 4.42.0
  - Resolved deprecation warnings
  - Updated to latest stable version
  - No breaking changes in our usage

---

**Last Updated**: 2025-10-07
