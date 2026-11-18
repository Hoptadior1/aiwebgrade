import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-steel">That page has moved or never existed.</p>
      <Link href="/home-improvement" className="btn-primary mt-6">See all calculators</Link>
    </div>
  );
}
