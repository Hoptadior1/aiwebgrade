import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Break-Even ROAS Calculator: Minimum ROAS to stay profitable";

export default function Image() {
  return ogImage("Break-Even ROAS Calculator", "Minimum ROAS to stay profitable", "Free business calculator");
}
