# Apply Log - Vue 3 + Supabase

A modern job application tracking system built with Vue 3, TypeScript, Tailwind CSS v4, and Supabase.

## Features

- ✅ Add, edit, and delete job applications with instant feedback
- ✅ Custom status and platform management with proper name preservation
- ✅ Advanced search and filtering capabilities
- ✅ Pagination support
- ✅ Optimistic updates with automatic background sync
- ✅ Smart caching to reduce unnecessary API calls
- ✅ Responsive design with mobile support
- ✅ Toast notifications
- ✅ TypeScript support with full type safety
- ✅ Row-level security (RLS) with Supabase

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Supabase CLI

## Setup Instructions

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd apply-log

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set Up Supabase Database

#### Option A: Using Supabase CLI (Recommended)
```bash
# Switch to supabase branch
git checkout supabase

# Link your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Switch back to main branch
git checkout main
```

#### Option B: Manual Setup

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `supabase/migrations/001_initial_schema.sql` (from supabase branch)
3. Execute the SQL

### 4. Deploy Edge Functions
```bash
# Switch to supabase branch
git checkout supabase

# Deploy all functions
supabase functions deploy jobs
supabase functions deploy statuses
supabase functions deploy platforms
supabase functions deploy search
supabase functions deploy exportJobsData

# Switch back to main branch
git checkout main
```

**Important**: Update CORS origins in edge functions before deploying to production:
- Edit `allowedOrigins` array in each function
- Add your production domain(s)

### 5. Run Development Server
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## Project Structure
```
src/
├── assets/             # Global styles (Tailwind CSS v4)
├── components/
│   ├── common/         # Reusable components (StatusDropdown, PlatformDropdown)
│   └── dashboard/      # Dashboard-specific components
│       ├── jobs/       # Job management (JobForm, JobList, EditModal, SearchBar)
│       ├── home/       # Dashboard home
│       ├── calendar/   # Calendar view
│       ├── analytics/  # Analytics view
│       └── contacts/   # Contacts management
├── stores/             # Pinia stores (jobStore, statusStore, platformStore, syncStore)
├── types/              # TypeScript type definitions
├── lib/                # Supabase client configuration
├── composables/        # Vue composables (useToast)
├── views/              # Page components
└── router/             # Vue Router configuration

supabase/ (on supabase branch)
├── functions/          # Edge functions
│   ├── jobs/          # CRUD operations for jobs
│   ├── statuses/      # Status management (defaults + custom)
│   ├── platforms/     # Platform management (defaults + custom)
│   ├── search/        # Advanced search with filters
│   └── exportJobsData/ # Export to CSV/JSON
└── migrations/         # Database schema and RLS policies
```

## Key Concepts

### Custom Fields (Status & Platforms)

The app handles custom statuses and platforms with proper separation of keys and names:

- **Key**: Normalized identifier (lowercase, hyphenated) - e.g., `"pending-review"`
- **Name**: Display value (original capitalization) - e.g., `"Pending Review"`

**Default Statuses**: Applied, Screening/Review, Interview Scheduled, Offer Received, Rejected, No Follow-up Required

**Default Platforms**: LinkedIn, Company Website, HR Email, WhatsApp, Recruiter Contact, Other

### Optimistic Updates

All operations (add, edit, delete) update the UI immediately and sync in the background:

1. Change appears instantly in UI
2. Background sync attempts automatically
3. If sync fails, change is marked as "pending"
4. Click "Sync Data" button to retry failed operations

### Smart Caching

- Jobs page caches data between tab navigations
- Only refetches on full page reload
- Reduces unnecessary API calls by ~50%

## Usage

### Basic Operations

- **Add Application**: Click "Add New Application" → Fill form → Submit
- **Edit Application**: Click edit icon → Modify fields → Save
- **Delete Application**: Click delete icon → Confirm
- **Update Status**: Use dropdown directly in job row
- **Search**: Use search bar with advanced filters
- **Export**: Click export button (CSV or JSON format)

### Creating Custom Fields

1. Open Status or Platform dropdown
2. Type new name (e.g., "Pending Review")
3. Click "Create" button
4. Custom field saves with proper capitalization
5. Click "Sync Data" to persist to backend

### Syncing Changes

- Most changes sync automatically in background
- If sync fails, "Sync Data" button appears
- Click to retry all pending operations
- Yellow indicator shows number of pending changes

## Build for Production
```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

Built files will be in `dist/` directory.

### Production Deployment Checklist

1. ✅ Update `allowedOrigins` in all edge functions
2. ✅ Set production environment variables
3. ✅ Enable RLS policies in Supabase
4. ✅ Deploy edge functions to production
5. ✅ Test authentication flow
6. ✅ Test custom fields creation and sync
7. ✅ Verify CORS settings

## Technologies Used

- **Vue 3** (Composition API) - Progressive JavaScript framework
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **Pinia** - Intuitive state management
- **Vue Router** - Official routing solution
- **Supabase** - Backend as a Service (Auth, Database, Edge Functions)
- **Lucide Vue Next** - Beautiful icon library
- **PostgreSQL** - Relational database via Supabase

## Database Schema
```sql
- users (extends auth.users)
- jobs (job applications with RLS)
- default_statuses (system-wide statuses)
- default_platforms (system-wide platforms)
- user_statuses (user custom statuses)
- user_platforms (user custom platforms)
```

All tables have Row Level Security (RLS) enabled.

## Troubleshooting

### Custom fields showing as keys instead of names

**Solution**: Ensure all 9 fixed files are properly replaced:
- 5 Vue components (StatusDropdown, PlatformDropdown, JobForm, EditModal, Jobs)
- 3 stores (statusStore, platformStore, jobStore)
- 1 edge function (jobs/index.ts)

### "Sync Data" button won't disappear

Check browser console for errors. Common causes:
- CORS not configured correctly in edge functions
- Missing authentication token
- Network connectivity issues

### Edge function deployment fails
```bash
# Verify you're on the correct branch
git branch

# Re-link project
supabase link --project-ref your-project-ref

# Deploy with verbose output
supabase functions deploy jobs --debug
```

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Test thoroughly
4. Submit pull request

For backend changes, work on the `supabase` branch.

## License

MIT

---

**Note**: The `supabase` branch contains all backend code (edge functions and migrations). Keep frontend (`main`) and backend (`supabase`) branches separate.