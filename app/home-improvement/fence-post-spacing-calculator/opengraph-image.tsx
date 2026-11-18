import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Fence Post Spacing Calculator: Even spacing & post count";

export default function Image() {
  return ogImage("Fence Post Spacing Calculator", "Even spacing & post count", "Free US construction calculator");
}
