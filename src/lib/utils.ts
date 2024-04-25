import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function snap(value: number, step: number) {
	return Math.round(value / step) * step;
}

export async function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

export async function preloadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.src = src;

		img.onload = () => resolve(img);
		img.onerror = (error) => reject(error);
	});
}

// https://gist.github.com/erikvullings/b71a0be49e5e79945805bd209e22c7d2\
export const uuid4 = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
