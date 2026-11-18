import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "French Drain Calculator: Gravel, pipe & fabric for a trench";

export default function Image() {
  return ogImage("French Drain Calculator", "Gravel, pipe & fabric for a trench", "Free US construction calculator");
}
