"use client";

import type { ReactNode } from "react";
import { openPrivacy } from "../lib/privacy";

export default function PrivacyButton({ className, children }: { className?: string; children: ReactNode }) {
  return <button type="button" className={className} onClick={openPrivacy}>{children}</button>;
}
