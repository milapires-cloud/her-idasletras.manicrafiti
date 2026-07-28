"use client";
import { ReactNode } from "react";

type Props = {
  onClick?: () => void;
  children: ReactNode;
  color?: "stone" | "wood" | "grass" | "gold" | "diamond" | "creeper" | "red";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
};

const colors: Record<string, string> = {
  stone: "bg-[#8b8b8b] text-white",
  wood: "bg-[#a06b3a] text-white",
  grass: "bg-[#5aab3a] text-white",
  gold: "bg-[#f5c518] text-black",
  diamond: "bg-[#4fd0e0] text-black",
  creeper: "bg-[#4caf50] text-white",
  red: "bg-[#c0392b] text-white",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-2 text-[10px]",
  md: "px-4 py-3 text-xs",
  lg: "px-6 py-4 text-sm",
};

export default function McButton({
  onClick,
  children,
  color = "stone",
  size = "md",
  disabled,
  className = "",
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mc-btn ${colors[color]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"} ${className}`}
    >
      {children}
    </button>
  );
}
