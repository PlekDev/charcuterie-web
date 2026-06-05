import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Combina clases de Tailwind de forma segura: junta condicionales con clsx
// y resuelve conflictos (la última clase gana) con tailwind-merge.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
