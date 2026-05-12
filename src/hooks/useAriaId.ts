import { useId } from 'react';

export default function useAriaId() {
	const id = useId();
	return {
		ariaId: id,
		descriptionId: `${id}-description`,
		labelId: `${id}-label`,
	};
}
