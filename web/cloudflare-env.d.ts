declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** "code" on a self-hosted Cloudflare deployment: sign-in with DEMO_ACCESS_CODE instead of platform headers. */
    WATERLINK_AUTH?: string;
    DEMO_ACCESS_CODE?: string;
    /** Optional long random key that signs the access cookie; without it the access code signs it. */
    WATERLINK_COOKIE_SECRET?: string;
  }
}
