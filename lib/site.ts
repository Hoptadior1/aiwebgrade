export const SITE = {
  name: "AIWebGrade Calculators",
  shortName: "AIWebGrade",
  tagline: "Free construction & project calculators for US homeowners and contractors",
  url: "https://www.aiwebgrade.com",
  contactEmail: "briandavidgta6@gmail.com", // change to your real inbox
  locale: "en_US",
};

export type ToolStatus = "live" | "soon";

export type Tool = {
  slug: string;
  section: "home-improvement" | "business";
  name: string;
  short: string;
  wave: 1 | 2 | 3;
  status: ToolStatus;
};

// Master catalog. Flip status to "live" as each tool ships; sitemap and nav pick it up automatically.
export const TOOLS: Tool[] = [
  { slug: "sonotube-calculator", section: "home-improvement", name: "Sonotube Calculator", short: "Concrete & bags for round pier forms", wave: 1, status: "live" },
  { slug: "concrete-footing-calculator", section: "home-improvement", name: "Concrete Footing Calculator", short: "Strip & pad footings, rebar, yards", wave: 1, status: "live" },
  { slug: "deck-footing-calculator", section: "home-improvement", name: "Deck Footing Calculator", short: "Post count, footing size & concrete", wave: 1, status: "live" },
  { slug: "fence-post-depth-calculator", section: "home-improvement", name: "Fence Post Depth Calculator", short: "Hole depth, width & concrete per post", wave: 1, status: "live" },
  { slug: "fence-post-spacing-calculator", section: "home-improvement", name: "Fence Post Spacing Calculator", short: "Even spacing & post count", wave: 1, status: "live" },
  { slug: "shed-foundation-calculator", section: "home-improvement", name: "Shed Foundation Calculator", short: "Gravel pad, blocks or slab", wave: 1, status: "live" },
  { slug: "concrete-slab-cost-calculator", section: "home-improvement", name: "Concrete Slab Cost Calculator", short: "Slab volume and installed cost", wave: 2, status: "soon" },
  { slug: "french-drain-calculator", section: "home-improvement", name: "French Drain Calculator", short: "Gravel, pipe & fabric for a trench", wave: 2, status: "soon" },
  { slug: "concrete-wall-calculator", section: "home-improvement", name: "Concrete Wall Calculator", short: "Poured walls & block core fill", wave: 2, status: "soon" },
  { slug: "fence-estimator", section: "home-improvement", name: "Chain Link & Panel Fence Estimator", short: "Materials list for a fence run", wave: 2, status: "soon" },
  { slug: "ecommerce-profit-margin-calculator", section: "business", name: "Ecommerce Profit Margin Calculator", short: "Margin after fees, shipping & ads", wave: 2, status: "soon" },
  { slug: "break-even-roas-calculator", section: "business", name: "Break-Even ROAS Calculator", short: "Minimum ROAS to stay profitable", wave: 2, status: "soon" },
  { slug: "retaining-wall-calculator", section: "home-improvement", name: "Retaining Wall Block Calculator", short: "Blocks, caps & gravel backfill", wave: 3, status: "soon" },
  { slug: "concrete-stairs-calculator", section: "home-improvement", name: "Concrete Stairs Calculator", short: "Steps, landing & concrete volume", wave: 3, status: "soon" },
  { slug: "marketplace-fee-calculator", section: "business", name: "Marketplace Fee Calculator", short: "Amazon, Etsy, eBay & more", wave: 3, status: "soon" },
];

export const toolPath = (t: Tool) => `/${t.section}/${t.slug}`;
export const liveTools = () => TOOLS.filter((t) => t.status === "live");
export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug)!;
