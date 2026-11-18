import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Home Improvement Calculators";

export default function Image() {
  return ogImage("Home Improvement Calculators", "Concrete, footings, decks, fences, gravel & drainage");
}
