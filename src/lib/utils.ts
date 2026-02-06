import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const POST_TAGS = [
  '团契',
  '生日会',
  '音乐',
  '户外活动',
  '其他'
] as const;

export type PostTag = typeof POST_TAGS[number];
