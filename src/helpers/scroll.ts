export function scrollToElement(
	scrollContainer: HTMLElement | null,
	element: HTMLElement | null,
	offsetTop: number = 16,
) {
	if (!scrollContainer || !element) return;

	scrollContainer.scrollTop =
		element.offsetTop - scrollContainer.offsetTop - offsetTop;
}

export const widgetSettingsScrollContainerId =
	'[slime2]_widget_settings_scroll_container';
