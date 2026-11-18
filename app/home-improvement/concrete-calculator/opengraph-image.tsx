import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Concrete Calculator: Yards, bags & cost for any project";

export default function Image() {
  return ogImage("Concrete Calculator", "Yards, bags & cost for any project", "Free US construction calculator");
}
