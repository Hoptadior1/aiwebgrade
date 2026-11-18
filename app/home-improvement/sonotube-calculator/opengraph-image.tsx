import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Sonotube Calculator: Concrete & bags for round pier forms";

export default function Image() {
  return ogImage("Sonotube Calculator", "Concrete & bags for round pier forms", "Free US construction calculator");
}
