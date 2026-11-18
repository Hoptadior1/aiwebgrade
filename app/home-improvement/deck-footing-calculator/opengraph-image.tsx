import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Deck Footing Calculator: Post count, footing size & concrete";

export default function Image() {
  return ogImage("Deck Footing Calculator", "Post count, footing size & concrete", "Free US construction calculator");
}
