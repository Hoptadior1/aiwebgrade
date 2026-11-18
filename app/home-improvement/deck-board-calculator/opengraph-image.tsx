import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Deck Board Calculator: Boards, linear feet & screws";

export default function Image() {
  return ogImage("Deck Board Calculator", "Boards, linear feet & screws", "Free US construction calculator");
}
