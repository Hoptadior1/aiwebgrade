import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Business & Ecommerce Calculators";

export default function Image() {
  return ogImage("Business & Ecommerce Calculators", "Profit margin, break-even ROAS & max CPA");
}
