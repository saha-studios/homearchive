# Home Archive

Home Archive is a private, living record of a home, its people, places, photos and memories. It uses Supabase for memories, photos and editable public-page content.

## Start locally

1. Copy `.env.example` to `.env.local` and add the two Supabase values.
2. Run `npm run dev` for development, or `npm run build` then `npm run start` for a production check.
3. Visit `http://localhost:3000`. The management area is at `/admin`.

## Make the public site editable

Run [`supabase/site-content.sql`](supabase/site-content.sql) in the Supabase SQL editor once. The new **Site studio** section at `/admin` then lets you publish changes to the brand, navigation, home page, and the title/intro copy for Gallery, Memories, Timeline, Estate Map, About and Creators.

The SQL keeps public content readable while requiring an authenticated Supabase user to change it. Configure Supabase Auth before sharing the admin route publicly.

## Keep it running

The included Docker setup restarts the site automatically after an app crash or machine reboot (unless the container is deliberately stopped):

```bash
docker compose up -d --build
```

It serves on port 3000 and checks its own health every 30 seconds. For true always-on public access, run this compose project on an always-on server or deploy the same Dockerfile to a managed container host; a laptop cannot remain available while it is powered off or disconnected.
