import { scrollToElement } from '@/helpers/scroll';
import { useEffect } from 'react';

export default function useAutoScrollDisclosureOpen(
	disclosureButtonRef: React.RefObject<HTMLButtonElement | null>,
	scrollContainerId: string,
) {
	useEffect(() => {
		if (!disclosureButtonRef.current) return;

		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type !== 'attributes') return;

				const disclosureButton = mutation.target as HTMLButtonElement;

				// run as soon as disclosure button has data-open
				// scrolls disclosure to top once it's open
				if (disclosureButton.dataset.open !== undefined) {
					const scrollContainer = document.getElementById(scrollContainerId);

					scrollToElement(scrollContainer, disclosureButton);
				}
			});
		});

		observer.observe(disclosureButtonRef.current, {
			attributeFilter: ['data-open'],
		});

		return () => {
			observer.disconnect();
		};
	}, [disclosureButtonRef.current]);
}
