/**
 * /llms-full.txt — everything /llms.txt links to, in one plain-text file:
 * services, the stand process, the complete /offer proposition for trade-show
 * organisers, selected projects and the FAQ in English, Russian and Uzbek.
 * Built in lib/llms.js from the live CMS content and the /offer dictionaries.
 */
import { llmsFull, loadLlmsData, TEXT_HEADERS } from '@/lib/llms';

export const revalidate = 3600;

export async function GET() {
  return new Response(llmsFull(await loadLlmsData()), { headers: TEXT_HEADERS });
}
