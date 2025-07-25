export default abstract class Random {
	// generate a random number between min (included) and max (excluded)
	static number(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	// generate a random integer between min (included) and max (included)
	static integer(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static chance(percentage: number): boolean {
		return Math.random() < percentage / 100;
	}

	static boolean(): boolean {
		return this.chance(50);
	}

	static index(array: Array<unknown>): number {
		return Math.floor(Math.random() * array.length);
	}

	static item<T>(array: Array<T>): T {
		return array[this.index(array)];
	}

	static hexCode(): string {
		const value = Math.floor(Math.random() * 0xffffff);
		return `#${value.toString(16).padEnd(6, '0')}`;
	}
}
