import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Construction calculators that give you a shopping list";

export default function Image() {
  return ogImage("Construction calculators that give you a shopping list", "17 free US calculators \u00b7 PDF reports");
}
