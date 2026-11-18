import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Concrete Stairs Calculator: Steps, landing & concrete volume";

export default function Image() {
  return ogImage("Concrete Stairs Calculator", "Steps, landing & concrete volume", "Free US construction calculator");
}
