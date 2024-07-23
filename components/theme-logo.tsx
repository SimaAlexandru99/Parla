import { useTheme } from "next-themes";
import Image from "next/image";
import { assets } from "@/constants/assets";
import React, { useState, useEffect } from "react";

interface ThemeLogoProps {
  width?: number;
  height?: number;
}

const ThemeLogo = ({ width = 50, height = 50 }: ThemeLogoProps) => {
  const { theme, resolvedTheme } = useTheme();
  const [imgSrc, setImgSrc] = useState(assets.logoLight);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc((theme === "dark" || resolvedTheme === "dark") ? assets.logoDark : assets.logoLight);
    setIsLoading(true);
  }, [theme, resolvedTheme]);

  const handleError = () => {
    // If the image fails to load, try the other theme's logo
    setImgSrc(imgSrc === assets.logoDark ? assets.logoLight : assets.logoDark);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={imgSrc}
        alt="NextMind Logo"
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={`logo-transition absolute top-0 left-0 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default React.memo(ThemeLogo);