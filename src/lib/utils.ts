import { clsx, type ClassValue } from "clsx"
import moment from "moment"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showAddress(value: string) {
  if (value === 'native') return 'native'
  if (value.length <= 10) return value
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}


export function formatSecurityUpdatedAt(value?: string | null) {
  if (!value) return '--';

  const parsed = moment(value);
  if (!parsed.isValid()) return '--';

  return parsed.format('MMM D, YYYY, h:mm A');
}