import DisplayAbout from '@/components/widget_settings/DisplayAbout';
import SettingCategory from '@/components/widget_settings/SettingCategory';
import SettingsGroup from '@/components/widget_settings/SettingsGroup';
import WidgetAccounts from '@/components/widget_settings/WidgetAccounts';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import type { WidgetSettings } from '@/helpers/json/widgetSettings';
import {
	scrollToElement,
	widgetSettingsScrollContainerId,
} from '@/helpers/scroll';
import { memo, useRef, useState } from 'react';
import WidgetSettingsSidebar from './WidgetSettingsSidebar';

type WidgetSettingsProps = {
	widgetId: string;
	settings: WidgetSettings;
};

const WidgetSettings = memo(function WidgetSettings({
	widgetId,
	settings,
}: WidgetSettingsProps) {
	const { widgetMeta } = useWidgetMeta(widgetId);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const accountsId =
		widgetMeta.accounts.length > 0
			? `[slime2]_widget_${widgetId}_accounts`
			: undefined;
	const aboutId = `[slime2]_widget_${widgetId}_about`;
	const [topScrollId, setTopScrollId] = useState<string>(
		accountsId || Object.keys(settings)[0],
	);

	function openMultiSection(id: string) {
		const multiSectionButton = document.getElementById(id);
		if (!multiSectionButton) return;

		// if already open, use the normal section scroller
		if (multiSectionButton.hasAttribute('data-open')) {
			scrollToSection(id);
		} else {
			// open multisection and use its internal scroll handler
			multiSectionButton.click();
		}
	}

	function scrollToSection(id: string) {
		const scrollContainer = scrollContainerRef.current;
		const section = document.getElementById(id);

		scrollToElement(scrollContainer, section);
	}

	function focusSection(id: string) {
		const section = document.getElementById(id);
		if (!section) return;

		section.focus();
	}

	return (
		<div className='flex flex-1 gap-4 overflow-hidden'>
			<WidgetSettingsSidebar
				settings={settings}
				topScrollId={topScrollId}
				aboutId={aboutId}
				accountsId={accountsId}
				onClickCategory={categoryId => {
					scrollToSection(categoryId);
					focusSection(categoryId);
				}}
				onClickSection={(sectionId, isMultiSection) => {
					if (isMultiSection) {
						openMultiSection(sectionId);
					} else {
						// multisection has its own scroll handler
						scrollToSection(sectionId);
					}

					focusSection(sectionId);
				}}
			/>

			<section className='m-0.5 flex flex-1 overflow-hidden light-container'>
				<div
					className='flex flex-1 flex-col gap-4 overflow-y-auto p-4'
					ref={scrollContainerRef}
					id={widgetSettingsScrollContainerId}
					onScroll={event => {
						const scrollContainer = event.currentTarget;
						const categoryIds = [...Object.keys(settings), aboutId];
						if (accountsId) {
							categoryIds.unshift(accountsId);
						}

						const currentScrollTop = scrollContainer.scrollTop;
						let newTopId = categoryIds[0];

						for (let i = 1; i < categoryIds.length; i++) {
							const categoryId = categoryIds[i];
							const categoryContainer = document.getElementById(categoryId);
							if (categoryContainer) {
								const categoryScrollTop =
									categoryContainer.offsetTop - scrollContainer.offsetTop - 16;

								if (categoryScrollTop > currentScrollTop) {
									break;
								}

								newTopId = categoryId;
							}
						}

						if (newTopId !== topScrollId) {
							setTopScrollId(newTopId);
						}
					}}
				>
					{accountsId && (
						<SettingCategory id={accountsId} label='Accounts'>
							<WidgetAccounts widgetId={widgetId} />
						</SettingCategory>
					)}

					{Object.entries(settings).map(([id, category]) => {
						return (
							<SettingCategory key={id} id={id} label={category.label}>
								<SettingsGroup settings={category.settings} />
							</SettingCategory>
						);
					})}

					<SettingCategory id={aboutId} label='About'>
						<DisplayAbout widgetId={widgetId} />
					</SettingCategory>
				</div>
			</section>
		</div>
	);
});

export default WidgetSettings;
