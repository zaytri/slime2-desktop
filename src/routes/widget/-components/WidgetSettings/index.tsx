import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import WidgetValuesProvider from '@/contexts/widget_values/WidgetValuesProvider';
import { i18nStringTransform } from '@/helpers/i18n';
import { loadWidgetMeta } from '@/helpers/json/widgetMeta';
import type {
	WidgetSetting,
	WidgetSettings,
} from '@/helpers/json/widgetSettings';
import { useWidgetSettings } from '@/helpers/queryHooks';
import useScrollTopObserver from '@/hooks/useScrollTopObserver';
import { useParams } from '@tanstack/react-router';
import { memo, useEffect, useRef } from 'react';
import CategorySetting from './CategorySetting';
import WidgetInfo from './WidgetInfo';

const WidgetSettings = memo(function WidgetSettings() {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const widgetSettingsQuery = useWidgetSettings(widgetId);
	const { widgetMeta, setWidgetMeta } = useWidgetMeta(widgetId);
	const settings: WidgetSettings = widgetSettingsQuery.data ?? {};

	const widgetInfoProps: Props.WithId<WidgetSetting.Category> = {
		id: '<[slime2-widget-info-id]>',
		label: 'Widget Info',
		settings: {},
	};

	const topId = useScrollTopObserver(scrollContainerRef, [
		widgetInfoProps.id,
		...Object.keys(settings),
	]);

	const isLoading = widgetSettingsQuery.isLoading;
	const isError = widgetSettingsQuery.isError;

	useEffect(() => {
		async function refreshWidgetMeta() {
			const meta = await loadWidgetMeta(widgetId);
			setWidgetMeta(meta);
		}

		refreshWidgetMeta();
	}, [widgetId]);

	if (isLoading) return <p>loading widget settings...</p>;
	if (isError) return <p>error loading widget settings!</p>;

	return (
		<div className='relative row-span-full grid flex-1 grid-cols-8 grid-rows-1 divide-x divide-amber-300 overflow-hidden bg-white'>
			<aside className='col-span-2 gap-2 overflow-y-auto bg-amber-100 text-amber-950'>
				{Object.entries({
					[widgetInfoProps.id]: widgetInfoProps,
					...settings,
				}).map(([categoryId, category]) => {
					return (
						<section
							key={categoryId}
							data-active={categoryId === topId}
							className='over:bg-amber-300 flex flex-col overflow-hidden py-1 has-[[data-active="true"]]:bg-amber-300 data-[active=true]:bg-amber-300'
						>
							<a
								href={`#${categoryId}`}
								className='font-fredoka over:underline px-3 text-xl font-medium uppercase'
							>
								<h3>{i18nStringTransform(category.label)}</h3>
							</a>

							<div className='flex flex-col'>
								{Object.entries(category.settings).map(
									([sectionId, section]) => {
										if (
											section.type !== 'section' &&
											section.type !== 'multi-section'
										)
											return null;

										return (
											<a
												key={sectionId}
												href={`#${sectionId}`}
												className='font-fredoka over:underline over:before:block relative pl-6 text-lg before:absolute before:left-3.5 before:hidden before:content-["-"]'
											>
												<h4>{i18nStringTransform(section.label)}</h4>
											</a>
										);
									},
								)}
							</div>
						</section>
					);
				})}
			</aside>

			<WidgetValuesProvider id={widgetId} settings={settings}>
				<section
					className='col-span-6 overflow-y-auto'
					ref={scrollContainerRef}
				>
					<div className='border-r border-stone-300 pb-8'>
						{widgetMeta && (
							<WidgetInfo {...widgetMeta} id={widgetInfoProps.id} />
						)}

						{Object.entries(settings).map(([id, category]) => {
							const props = { id, ...category };
							return <CategorySetting key={id} {...props} />;
						})}
					</div>
				</section>
			</WidgetValuesProvider>
		</div>
	);
});

export default WidgetSettings;
