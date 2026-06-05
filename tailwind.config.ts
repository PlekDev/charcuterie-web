import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			headline: ["var(--font-headline)", "serif"],
			body: ["var(--font-body)", "sans-serif"],
			label: ["var(--font-label)", "sans-serif"],
		},
  		colors: {
			// Map to CSS variables from globals.css for compatibility with existing components
			background: "var(--background)",
			foreground: "var(--foreground)",
  			primary: {
				DEFAULT: "#012d1d",
				foreground: "#ffffff",
  			},
  			secondary: {
				DEFAULT: "#7b5819",
				foreground: "#ffffff",
  			},
  		},
  		borderRadius: {
			lg: "0.5rem",
			xl: "0.75rem",
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
