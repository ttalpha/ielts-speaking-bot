import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 12).padStart(12, "0")
  );
}

export function getOverallScore(
  fcScore: number,
  lrScore: number,
  graScore: number,
  pronunciationScore: number
) {
  const totalScore = fcScore + lrScore + graScore + pronunciationScore;
  const overallScore = Math.round((totalScore / 4) * 2) / 2; // Round to the nearest 0.5
  return overallScore;
}
