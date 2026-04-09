/**
 * Root page — the middleware handles locale redirect,
 * but this fallback ensures no 404 for direct "/" access.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/ru');
}
