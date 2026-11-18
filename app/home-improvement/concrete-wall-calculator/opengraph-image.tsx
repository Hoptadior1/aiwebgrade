import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Concrete Wall Calculator: Poured walls & block core fill";

export default function Image() {
  return ogImage("Concrete Wall Calculator", "Poured walls & block core fill", "Free US construction calculator");
}
