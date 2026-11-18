"use client";

import { useEffect, useState } from "react";
import { gpcEnabled, isOptedOut, setOptOut } from "@/lib/privacy";

export default function PrivacyToggle() {
  const [out, setOut] = useState(false);
  const [gpc, setGpc] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOut(isOptedOut());
    setGpc(gpcEnabled());
  }, []);

  if (gpc) {
    return (
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900">
        Your browser is sending a Global Privacy Control signal, so you are already opted out of the sale or sharing of
        your personal information on this site.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={out}
          onChange={(e) => {
            setOut(e.target.checked);
            setOptOut(e.target.checked);
            setSaved(true);
          }}
          className="mt-1 h-5 w-5 accent-[#f5a300]"
        />
        <span>
          <span className="block font-semibold">Do not sell or share my personal information</span>
          <span className="text-sm text-steel">
            We'll stop loading personalized (interest-based) ad tags in this browser. You may still see ads, but they
            won't be based on your browsing.
          </span>
        </span>
      </label>
      {saved && <p className="mt-3 text-sm text-green-800">Saved. This applies to this browser; reload the page to take effect.</p>}
    </div>
  );
}
