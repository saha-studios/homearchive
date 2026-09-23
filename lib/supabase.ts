import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      new Promise<Response>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Supabase request timed out after 5 seconds"));
        }, 5000);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  { global: { fetch: fetchWithTimeout } }
);
