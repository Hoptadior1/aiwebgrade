import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Retaining Wall Block Calculator: Blocks, caps & gravel backfill";

export default function Image() {
  return ogImage("Retaining Wall Block Calculator", "Blocks, caps & gravel backfill", "Free US construction calculator");
}
