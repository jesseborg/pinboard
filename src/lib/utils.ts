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
		img.onerror = () => reject();
	});
}
