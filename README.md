# Job Application Tracker - Vue 3 + Supabase

A modern job application tracking system built with Vue 3, TypeScript, Tailwind CSS v4, and Supabase.

## Features

- ✅ Add, edit, and delete job applications
- ✅ Custom status management with optimistic updates
- ✅ Custom platform management
- ✅ Pagination support
- ✅ Offline-first with sync capability
- ✅ Responsive design
- ✅ Toast notifications
- ✅ TypeScript support

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set Up Supabase Database

Run the migration file in your Supabase SQL editor:

- Go to Supabase Dashboard → SQL Editor
- Copy the contents of `supabase/migrations/001_initial_schema.sql`
- Execute the SQL

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy jobs
supabase functions deploy statuses
supabase functions deploy platforms
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Global styles
├── components/      # Vue components
├── stores/          # Pinia stores
├── types/           # TypeScript types
├── lib/             # Supabase client
├── composables/     # Vue composables
└── App.vue          # Root component

supabase/
├── functions/       # Edge functions
└── migrations/      # Database migrations
```

## Usage

1. **Add Application**: Fill the form and click "Add New Application"
2. **Edit Application**: Click the edit icon on any job row
3. **Delete Application**: Click the delete icon and confirm
4. **Update Status**: Use the dropdown in each row
5. **Sync Changes**: Click "Sync Data" button to push changes to backend
6. **Custom Status/Platform**: Type a new name in the search box and create it

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first CSS
- **Pinia** - State management
- **Supabase** - Backend as a Service
- **Lucide Vue** - Icon library

## Notes

- All changes are optimistic and reflected immediately in the UI
- Click "Sync Data" to persist changes to the backend
- The app handles connection failures gracefully
- Custom statuses and platforms are synced before job data

## License

MIT