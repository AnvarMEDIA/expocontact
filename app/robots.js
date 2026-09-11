/**
 * robots.txt — Next.js 14 App Router robots.js convention
 *
 * Besides the classic search crawlers we explicitly allow the crawlers that
 * feed AI assistants (ChatGPT, Gemini, Claude, Perplexity, DeepSeek/Grok via
 * Common Crawl and Bytedance). Being crawlable by them is a precondition for
 * showing up in their answers; a bare "*" rule is often not enough because
 * several of these bots look for their own name before falling back to "*".
 */
export default function robots() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  const disallow = ['/admin', '/api/'];

  const aiCrawlers = [
    'GPTBot',            // OpenAI training
    'ChatGPT-User',      // ChatGPT browsing on user request
    'OAI-SearchBot',     // ChatGPT search index
    'Google-Extended',   // Gemini / Google AI training
    'ClaudeBot',         // Anthropic
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'DeepSeekBot',
    'xAI-Grok',
    'Bytespider',        // Bytedance / Doubao
    'Applebot-Extended', // Apple Intelligence
    'Amazonbot',
    'CCBot',             // Common Crawl, used by many LLM datasets
    'cohere-ai',
    'Meta-ExternalAgent',
    'YandexBot',
    'Bingbot',
    'Googlebot',
  ];

  return {
    rules: [
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: '/', disallow })),
      { userAgent: '*', allow: '/', disallow },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
