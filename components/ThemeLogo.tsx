import { useTheme } from "next-themes";
import Image from "next/image";
import { assets } from "@/constants/assets";
import React, { useState } from "react";

interface ThemeLogoProps {
  width?: number;
  height?: number;
}

const ThemeLogo = ({ width = 50, height = 50 }: ThemeLogoProps) => {
  const { resolvedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={assets.logo}
        alt="Parla Logo"
        width={width}
        height={height}
        onLoad={handleLoad}
        className={`logo-transition absolute top-0 left-0 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${resolvedTheme === 'dark' ? 'filter invert' : ''}`}
      />
    </div>
  );
};

export default React.memo(ThemeLogo);