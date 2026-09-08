"use client";

import { useState } from "react";
import { StorefrontTemplate } from "@/components/layout/StorefrontTemplate";
import { HomeTemplate } from "@/components/home/HomeTemplate";

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <StorefrontTemplate>
      <HomeTemplate activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
    </StorefrontTemplate>
  );
};

export default HomePage;
