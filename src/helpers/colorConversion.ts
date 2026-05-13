import type { HsvaColor } from '@uiw/react-color';
import Color from 'colorjs.io';

export function hsvaToString(hsva: HsvaColor): string {
	const color = new Color('hsv', [hsva.h, hsva.s, hsva.v], hsva.a);
	return color.to('srgb').toString({ format: 'hex' });
}

export function stringToHsva(value?: string): HsvaColor {
	const color = new Color(
		value && CSS.supports('color', value) ? value : '#FFFFFF',
	);

	// fallback to values for full opacity white
	const hsva: HsvaColor = {
		h: fallbackNumber(color.hsv.h, 0),
		s: fallbackNumber(color.hsv.s, 0),
		v: fallbackNumber(color.hsv.v, 100),
		a: fallbackNumber(color.alpha, 1),
	};

	return hsva;
}

function fallbackNumber(number: unknown, fallback: number) {
	if (typeof number !== 'number' || Number.isNaN(number)) {
		return fallback;
	}

	return number;
}
