import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Concrete Footing Calculator: Strip & pad footings, rebar, yards";

export default function Image() {
  return ogImage("Concrete Footing Calculator", "Strip & pad footings, rebar, yards", "Free US construction calculator");
}
