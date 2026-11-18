import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Ecommerce Profit Margin Calculator: Margin after fees, shipping & ads";

export default function Image() {
  return ogImage("Ecommerce Profit Margin Calculator", "Margin after fees, shipping & ads", "Free business calculator");
}
