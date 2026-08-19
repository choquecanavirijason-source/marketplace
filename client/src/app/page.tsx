"use client";

import { useState } from "react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { HomeTemplate } from "@/presentation/templates/HomeTemplate";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <StorefrontTemplate>
      <HomeTemplate activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
    </StorefrontTemplate>
  );
}
