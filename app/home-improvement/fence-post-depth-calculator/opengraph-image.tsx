import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Fence Post Depth Calculator: Hole depth, width & concrete per post";

export default function Image() {
  return ogImage("Fence Post Depth Calculator", "Hole depth, width & concrete per post", "Free US construction calculator");
}
