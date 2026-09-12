import { ArrowRightLeft } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

const iconBox = {
  sm: "h-8 w-8 rounded-xl",
  md: "h-9 w-9 rounded-2xl",
  lg: "h-12 w-12 rounded-2xl",
};

const iconSize = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

const textSize = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

const taglineSize = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-xs",
};

export function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center shadow-lg ${iconBox[size]}`}
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
        }}
      >
        <ArrowRightLeft className={`${iconSize[size]} text-white`} strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-primary-c dark:text-primary-c ${textSize[size]}`}>
            Skill<span className="text-accent-c dark:text-accent-c">Bridge</span>
          </span>
          {showTagline && (
            <span className={`mt-0.5 font-medium tracking-wide text-muted-c dark:text-muted-c ${taglineSize[size]}`}>
              By Stratustal
            </span>
          )}
        </div>
      )}
    </div>
  );
}
