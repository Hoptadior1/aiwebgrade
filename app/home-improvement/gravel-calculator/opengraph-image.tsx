import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Gravel Calculator: Tons, yards & bags for driveways and paths";

export default function Image() {
  return ogImage("Gravel Calculator", "Tons, yards & bags for driveways and paths", "Free US construction calculator");
}
