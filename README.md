# Jotion – Collaborative Note-Taking

Modern Notion-style editor built with Next.js, Convex, and Clerk. Create, organize, and publish documents with rich text editing, custom icons, cover images, and shareable read-only previews.

> **Live demo:** https://note-taking-app-ten-pied.vercel.app/

![Jotion screenshot](public/documents.png)

## Features

- **Rich editor** powered by BlockNote with headings, callouts, embeds, and slash commands.
- **Authentication & multi-user data** via Clerk + Convex so every document belongs to the signed-in user.
- **Document tree & search** with instant filtering, trash management, and responsive sidebar resizing.
- **Branding controls** (icons, cover uploads through Edge Store, light/dark themes).
- **Publishing flow** to share public previews at `/preview/:id`, including copy-to-clipboard links.
- **Responsive UI** built with Tailwind CSS, Radix UI primitives, and `@shadcn/ui` patterns.

## Tech Stack

- [Next.js 16 (App Router)](https://nextjs.org/) + TypeScript
- [Convex](https://convex.dev/) for database, functions, and subscriptions
- [Clerk](https://clerk.com/) for authentication
- [Edge Store](https://edgestore.dev/) for cover image uploads
- [BlockNote](https://blocknotejs.org/) for the editor experience
- UI: Tailwind CSS 4, Radix UI, Lucide Icons, Sonner toasts, Zustand state

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn/bun)
- Convex CLI (`npm install -g convex`) if you plan to run the backend locally
- Clerk + Edge Store accounts for API keys

### 1. Install dependencies

```bash
git clone https://github.com/<your-username>/notion-clone.git
cd notion-clone
npm install
```

### 2. Configure environment variables

Create `.env.local` and `.env` (Convex) files. Required values:

| Variable | Description |
| --- | --- |
| `CONVEX_DEPLOYMENT` | Convex deployment name (`npx convex dev` provides one) |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `EDGE_STORE_ACCESS_KEY` / `EDGE_STORE_SECRET_KEY` | Edge Store credentials for uploads |

Convex reads secrets from `convex/.env` if preferred—mirror them there when running `npx convex dev`.

### 3. Run the dev servers

```bash
# Start Convex (in a separate terminal)
npx convex dev

# Start Next.js
npm run dev
```

Visit http://localhost:3000. Signed-out users see the marketing page; authenticated users land on `/documents`.

### 4. Lint, build, and preview production

```bash
npm run lint   # ESLint
npm run build  # Next.js production build
npm run start  # Run compiled app
```

## Deployment

- **Frontend:** Deploy the Next.js app to [Vercel](https://vercel.com/) (current production build: https://note-taking-app-ten-pied.vercel.app/).
- **Backend:** Deploy Convex using `npx convex deploy` and copy the generated `CONVEX_DEPLOYMENT`/`NEXT_PUBLIC_CONVEX_URL`.
- **Environment:** Ensure all environment variables above are configured in Vercel + Convex dashboard.

## Project Overview

```
app/
  (marketing)/              # Landing page
  (main)/(routes)/documents # Authenticated app shell + editor
  (public)/preview/[id]/    # Read-only published view
components/                 # Shared UI building blocks (toolbar, cover, editor, etc.)
convex/                     # Database schema & serverless functions
hooks/                      # Client hooks for search, settings, upload, etc.
```

## Contributing & Feedback

Issues and PRs are welcome! If you deploy your own version, feel free to open an issue with your link or improvements. For questions, reach out via GitHub Discussions or email listed on your profile.
