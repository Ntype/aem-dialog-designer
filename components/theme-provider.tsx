"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"

// Props que acepta ThemeProvider
interface ThemeProviderProps {
  children: ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: "light" | "dark" | "system"
  enableSystem?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}