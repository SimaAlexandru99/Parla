'use client';

import { useTheme } from "next-themes";
import Image from "next/image";
import { assets } from "@/constants/assets"; // Adjust the import path as needed
import React from "react";

interface ThemeLogoProps {
  width?: number;
  height?: number;
}

const ThemeLogo = ({ width = 50, height = 50 }: ThemeLogoProps) => {
  const { theme, resolvedTheme } = useTheme();

  const logoSrc = (theme === "dark" || resolvedTheme === "dark") ? assets.logoDark : assets.logoLight;

  return (
    <Image
      src={logoSrc}
      alt="NextMind Logo"
      width={width}
      height={height}
    />
  );
};

export default React.memo(ThemeLogo);
