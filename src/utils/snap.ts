export function snap(value: number, step: number) {
	return Math.round(value / step) * step;
}
