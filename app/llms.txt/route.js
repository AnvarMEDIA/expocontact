/**
 * /llms.txt — the short brief about the company for AI assistants, in the
 * llmstxt.org shape: name, one-paragraph summary, key facts, then sections of
 * links. The long version is /llms-full.txt; both are built in lib/llms.js
 * from the same content the site renders, so they never drift.
 *
 * Nothing here is hidden from people: the same facts are on the landing, the
 * FAQ pages and /offer. Serving crawlers content that visitors cannot see is
 * cloaking and is not what this does.
 */
import { llmsIndex, loadLlmsData, TEXT_HEADERS } from '@/lib/llms';

export const revalidate = 3600;

export async function GET() {
  return new Response(llmsIndex(await loadLlmsData()), { headers: TEXT_HEADERS });
}
