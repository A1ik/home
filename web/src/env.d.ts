/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<{ DB: D1Database }>;

declare namespace App {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Locals extends Runtime {}
}
