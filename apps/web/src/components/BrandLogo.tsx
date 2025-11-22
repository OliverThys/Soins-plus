import logoSoinsPlus from "../assets/logo-soinsplus.png";

type BrandLogoProps = {
  tag?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<BrandLogoProps["size"]>, { width: number; height: number }> = {
  sm: { width: 100, height: 28 },
  md: { width: 120, height: 34 },
  lg: { width: 140, height: 40 },
};

export function BrandLogo({ tag, size = "md" }: BrandLogoProps) {
  const dimensions = sizeMap[size];
  
  return (
    <div className="brand-logo" aria-label="SOINS+">
      <img
        src={logoSoinsPlus}
        alt="SOINS+"
        width={dimensions.width}
        height={dimensions.height}
        className="brand-logo__img"
        style={{ objectFit: "contain" }}
      />
      {tag && (
        <span className="brand-logo__tag">
          {tag.toUpperCase()}
        </span>
      )}
    </div>
  );
}

