import { useTheme } from "next-themes";
import Image from "next/image";
import { assets } from "@/constants/assets";
import React, { useState } from "react";

interface ThemeLogoProps {
  width?: number;
  height?: number;
}

const ThemeLogo = ({ width = 50, height = 50 }: ThemeLogoProps) => {
  const { theme, resolvedTheme } = useTheme();
  const [imgSrc, setImgSrc] = useState(() => 
    (theme === "dark" || resolvedTheme === "dark") ? assets.logoDark : assets.logoLight
  );

  const handleError = () => {
    // If the image fails to load, try the other theme's logo
    setImgSrc(imgSrc === assets.logoDark ? assets.logoLight : assets.logoDark);
  };

  return (
    <Image
      src={imgSrc}
      alt="NextMind Logo"
      width={width}
      height={height}
      onError={handleError}
    />
  );
};

export default React.memo(ThemeLogo);