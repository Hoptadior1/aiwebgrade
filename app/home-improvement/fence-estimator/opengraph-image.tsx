import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Fence Calculator: Wood, chain link & panel fence materials";

export default function Image() {
  return ogImage("Fence Calculator", "Wood, chain link & panel fence materials", "Free US construction calculator");
}
