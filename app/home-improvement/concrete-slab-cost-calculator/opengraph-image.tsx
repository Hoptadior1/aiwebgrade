import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Concrete Slab Cost Calculator: Slab volume and installed cost";

export default function Image() {
  return ogImage("Concrete Slab Cost Calculator", "Slab volume and installed cost", "Free US construction calculator");
}
