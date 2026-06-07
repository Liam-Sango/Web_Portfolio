// Keep in sync with `basePath` in next.config.ts.
//
// Next.js automatically prefixes basePath onto next/link, next/image, and
// framework assets — but NOT plain <a href> / download links. For those
// (e.g. /resume.pdf in public/) we must prepend it ourselves, or the link
// 404s once the site is served under https://<user>.github.io/002/.
export const BASE_PATH = "/002";

/** Prefix a public-root absolute path (e.g. "/resume.pdf") with the basePath. */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
