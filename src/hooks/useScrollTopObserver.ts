import { useEffect, useState } from 'react';

/**
 * given a scrolling root element reference and target element IDs
 * returns the lowest ID at or above the top
 *
 * used for highlighting nav items in a sidebar
 * based on which section is at the top
 */
export default function useScrollTopObserver(
	rootRef: React.RefObject<HTMLDivElement | null>,
	targetIds: string[],
) {
	const [topId, setTopId] = useState(targetIds[0]);
	const [prevScrollTop, setPrevScrollTop] = useState(0);

	useEffect(() => {
		function onIntersect(entries: IntersectionObserverEntry[]) {
			if (!rootRef.current) return;

			// necessary to skip calculations if there was no scroll distance change
			const currentScrollTop = rootRef.current.scrollTop;
			if (prevScrollTop === currentScrollTop) return;

			setPrevScrollTop(currentScrollTop);

			let targetId;
			for (const entry of entries) {
				const relativeTop =
					entry.boundingClientRect.top -
					rootRef.current.getBoundingClientRect().top;

				if (relativeTop <= 0) {
					targetId = entry.target.id;
				} else {
					break;
				}
			}

			if (targetId) {
				setTopId(targetId);
			}
		}

		const observer = new IntersectionObserver(onIntersect, {
			root: rootRef.current,
			rootMargin: '-1px 0px 0px 0px',
			threshold: [0, 1],
		});

		targetIds.forEach(targetId => {
			const element = document.getElementById(targetId);
			if (element) observer.observe(element);
		});

		return () => {
			observer.disconnect();
		};
	}, [rootRef.current, targetIds]);

	return topId;
}
