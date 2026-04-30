// referenced from https://ariakit.org/examples/tab-panel-animated

import type { TabPanelProps } from '@ariakit/react';
import { TabPanel, useStoreState, useTabContext } from '@ariakit/react';
import type { ComponentRef } from 'react';
import { forwardRef, useEffect, useId, useRef } from 'react';

const TabPanelWithPrevious = forwardRef<
	ComponentRef<typeof TabPanel>,
	TabPanelProps
>(function TabPanelWithPrevious(props, ref) {
	const tab = useTabContext();
	const defaultId = useId();
	const id = props.id ?? defaultId;
	const tabId = useStoreState(
		tab,
		() => props.tabId ?? tab?.panels.item(id)?.tabId,
	);
	const previousTabId = usePrevious(useStoreState(tab, 'selectedId'));
	const wasOpen = tabId && previousTabId === tabId;
	return (
		<TabPanel
			ref={ref}
			id={id}
			tabId={tabId}
			{...props}
			data-previous={wasOpen || undefined}
		/>
	);
});

export default TabPanelWithPrevious;

function usePrevious<T>(value: T) {
	const ref = useRef<T>(value);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}
