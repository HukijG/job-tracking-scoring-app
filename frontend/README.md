# Job Tracking Frontend

SvelteKit frontend for the Job Tracking and Scoring System, deployed on Cloudflare Pages.

## Tech Stack

- **Framework**: SvelteKit 2.x with TypeScript
- **Adapter**: Cloudflare Pages
- **State Management**: Svelte stores
- **Styling**: Scoped CSS (component-level)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see `../backend/README.md`)

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server (default: http://localhost:5173)
npm run dev

# Type checking
npm run check

# Type checking in watch mode
npm run check:watch
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL=http://localhost:8787  # Backend API URL
VITE_ENVIRONMENT=development
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── routes/              # SvelteKit file-based routing
│   │   ├── +layout.svelte   # Root layout with navigation
│   │   ├── +page.svelte     # Homepage
│   │   ├── dashboard/       # Job dashboard page
│   │   ├── score/           # Scoring interface page
│   │   └── login/           # Login page
│   ├── lib/
│   │   ├── components/      # Reusable components
│   │   │   ├── JobCard.svelte
│   │   │   └── Navigation.svelte
│   │   ├── stores/          # Svelte stores for state management
│   │   │   ├── auth.ts      # Authentication state
│   │   │   └── jobs.ts      # Jobs data state
│   │   └── api/             # API client
│   │       └── client.ts    # Backend API communication
│   └── app.html             # HTML template
├── static/                  # Static assets
├── svelte.config.js         # SvelteKit configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Features

### Routing

- `/` - Homepage/landing
- `/login` - Authentication
- `/dashboard` - Main job dashboard with rankings
- `/score` - Job scoring interface

### State Management

- **auth** store: User authentication state, login/logout
- **jobs** store: Job data, fetching, filtering

### API Integration

The API client (`src/lib/api/client.ts`) handles:
- Authentication token management
- Request/response handling
- Error handling
- All backend API endpoints

## Development Workflow

1. Start backend: `cd ../backend && npm run dev`
2. Start frontend: `npm run dev`
3. Visit http://localhost:5173
4. Login page will be the first screen

## Deployment

Deploys to Cloudflare Pages:

```bash
npm run build
# Deploy .svelte-kit/cloudflare directory to Cloudflare Pages
```

See `../DEPLOYMENT.md` for full deployment instructions.

## Next Steps (Phase 4+)

- [ ] Complete dashboard UI with job cards
- [ ] Implement filtering and sorting
- [ ] Build scoring form interface
- [ ] Add real-time updates
- [ ] Implement responsive design
- [ ] Add loading states and error handling

## Notes

- Authentication uses JWT tokens stored in localStorage
- API client automatically attaches auth token to requests
- Navigation component hidden on login page
- Uses Svelte 5 runes (`$state`, `$derived`, `$props`)
