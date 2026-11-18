"use client";

import type { ComponentType } from "react";
import ConcreteCalculator from "@/components/calculators/ConcreteCalculator";
import DeckBoardCalculator from "@/components/calculators/DeckBoardCalculator";
import DeckFootingCalculator from "@/components/calculators/DeckFootingCalculator";
import FenceDepthCalculator from "@/components/calculators/FenceDepthCalculator";
import FenceEstimator from "@/components/calculators/FenceEstimator";
import FenceSpacingCalculator from "@/components/calculators/FenceSpacingCalculator";
import FootingCalculator from "@/components/calculators/FootingCalculator";
import FrenchDrainCalculator from "@/components/calculators/FrenchDrainCalculator";
import GravelCalculator from "@/components/calculators/GravelCalculator";
import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";
import RetainingWallCalculator from "@/components/calculators/RetainingWallCalculator";
import RoasCalculator from "@/components/calculators/RoasCalculator";
import ShedFoundationCalculator from "@/components/calculators/ShedFoundationCalculator";
import SlabCostCalculator from "@/components/calculators/SlabCostCalculator";
import SonotubeCalculator from "@/components/calculators/SonotubeCalculator";
import StairsCalculator from "@/components/calculators/StairsCalculator";
import WallCalculator from "@/components/calculators/WallCalculator";

/** slug → calculator component, used by /embed/[slug]. */
export const EMBEDS: Record<string, ComponentType> = {
  "concrete-calculator": ConcreteCalculator,
  "deck-board-calculator": DeckBoardCalculator,
  "deck-footing-calculator": DeckFootingCalculator,
  "fence-post-depth-calculator": FenceDepthCalculator,
  "fence-estimator": FenceEstimator,
  "fence-post-spacing-calculator": FenceSpacingCalculator,
  "concrete-footing-calculator": FootingCalculator,
  "french-drain-calculator": FrenchDrainCalculator,
  "gravel-calculator": GravelCalculator,
  "ecommerce-profit-margin-calculator": ProfitMarginCalculator,
  "retaining-wall-calculator": RetainingWallCalculator,
  "break-even-roas-calculator": RoasCalculator,
  "shed-foundation-calculator": ShedFoundationCalculator,
  "concrete-slab-cost-calculator": SlabCostCalculator,
  "sonotube-calculator": SonotubeCalculator,
  "concrete-stairs-calculator": StairsCalculator,
  "concrete-wall-calculator": WallCalculator,
};

export function EmbedRenderer({ slug }: { slug: string }) {
  const C = EMBEDS[slug];
  return C ? <C /> : null;
}
