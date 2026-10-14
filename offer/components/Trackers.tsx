/**
 * Optional ad-platform tags, switched on by environment variables:
 *   NEXT_PUBLIC_GA4_ID              Google Analytics 4 measurement id (G-…)
 *   NEXT_PUBLIC_GADS_ID             Google Ads tag id (AW-…)
 *   NEXT_PUBLIC_LINKEDIN_PARTNER_ID LinkedIn Insight Tag partner id
 * An empty variable means the script is not loaded at all. The Meta Pixel is
 * not here: it is part of the layout, like on the main site.
 */
import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "";
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || "";

/** Ids end up inside inline scripts, so only the characters they are made of pass. */
const safeId = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "");

export default function Trackers() {
  const gtagIds = [GA4_ID, GADS_ID].map(safeId).filter(Boolean);
  const linkedIn = safeId(LINKEDIN_PARTNER_ID);

  return (
    <>
      {gtagIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`} strategy="afterInteractive" />
          <Script id="of-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${gtagIds
              .map((id) => `gtag('config','${id}');`)
              .join("")}`}
          </Script>
        </>
      )}
      {linkedIn && (
        <Script id="of-linkedin" strategy="lazyOnload">
          {`window._linkedin_partner_id="${linkedIn}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(window._linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`}
        </Script>
      )}
    </>
  );
}
