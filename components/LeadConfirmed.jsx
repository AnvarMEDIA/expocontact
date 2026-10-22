'use client';

import { useEffect } from 'react';
import { takeLead } from '@/lib/leadHandoff';
import { trackLead } from '@/lib/metaPixel';
import { trackGoogleLead } from '@/lib/googleTag';

/**
 * On the thank-you page: report the conversion of the lead that brought the
 * visitor here — Meta Lead and, when configured, the Google Ads conversion
 * event — once. Without a confirmed lead in this tab (a direct visit, a
 * reload, a second tab) it reports nothing. Renders nothing.
 */
export default function LeadConfirmed() {
  useEffect(() => {
    const lead = takeLead();
    if (!lead) return;
    const audience = lead.audience === 'organiser' ? 'organiser' : 'exhibitor';
    trackLead(lead.form, { content_category: audience });
    trackGoogleLead({ audience });
  }, []);
  return null;
}
