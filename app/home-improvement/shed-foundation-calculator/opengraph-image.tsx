import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Shed Foundation Calculator: Gravel pad, blocks or slab";

export default function Image() {
  return ogImage("Shed Foundation Calculator", "Gravel pad, blocks or slab", "Free US construction calculator");
}
