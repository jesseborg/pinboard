import { Point } from "@/components/pinboard/types";
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

export function round(value: number, precision: number = 2) {
	return (
		Math.round((value + Number.EPSILON) * Math.pow(10, precision)) /
		Math.pow(10, precision)
	);
}

export function viewportCenter(): Point {
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

// d=√((x2 – x1)² + (y2 – y1)²)
export function euclideanDistance(
	[x1, y1]: [number, number],
	[x2, y2]: [number, number]
) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function blobToWebP(blob: Blob) {
	// Create image from Blob
	return new Promise<Blob | null>((resolve) => {
		const img = new Image();
		img.onload = () => {
			// Draw image to canvas
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			canvas.getContext("2d")?.drawImage(img, 0, 0);

			// Convert canvas to WebP Blob
			canvas.toBlob(resolve, "image/webp");
		};
		img.src = URL.createObjectURL(blob);
	});
}
