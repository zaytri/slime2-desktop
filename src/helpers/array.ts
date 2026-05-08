import { deepCopyObject } from '@/contexts/common';

export function swapItems<T>(
	array: NonUndefined<T>[],
	oldIndex: number,
	newIndex: number,
): NonUndefined<T>[] {
	if (oldIndex === newIndex) {
		throw new Error(
			`[swapItems]: oldIndex (${oldIndex}) and newIndex ${newIndex} are the same value! This swap is unnecessary...`,
		);
	}

	const arrayLength = array.length;
	if (oldIndex < 0 || oldIndex > arrayLength - 1) {
		throw new Error(
			`[swapItems]: oldIndex (${oldIndex}) is out of bounds! (array length: ${arrayLength})`,
		);
	}
	if (newIndex < 0 || newIndex > arrayLength - 1) {
		throw new Error(
			`[swapItems]: newIndex (${newIndex}) is out of bounds! (array length: ${arrayLength})`,
		);
	}

	const newArray = deepCopyObject(array);
	newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]!);
	return newArray;
}
