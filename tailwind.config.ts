import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{ts,tsx,mdx}",
		"./src/components/**/*.{ts,tsx,mdx}",
		"./src/app/**/*.{ts,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			mono: ["JetBrains Mono", "monospace"],
		},
	},
	plugins: [],
};
export default config;
