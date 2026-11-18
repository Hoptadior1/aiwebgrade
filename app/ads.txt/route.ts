import { ADS_TXT } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
  const body = ADS_TXT.length ? ADS_TXT.join("\n") + "\n" : "# Add your ad network lines in lib/ads.ts (ADS_TXT)\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
