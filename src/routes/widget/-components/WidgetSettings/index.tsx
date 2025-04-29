import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { useWidgetSettings } from '@/helpers/queryHooks';
import useScrollTopObserver from '@/hooks/useScrollTopObserver';
import { useParams } from '@tanstack/react-router';
import clsx from 'clsx';
import { memo, useRef } from 'react';
import CategorySetting from './CategorySetting';

const WidgetSettings = memo(function WidgetSettings() {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const { data = [], isError, isLoading } = useWidgetSettings(widgetId);
	const topRef = useRef<HTMLDivElement>(null);

	const widgetInfoCategory: WidgetSetting.Category = {
		id: '[slime2-widget-info-id]',
		label: 'Widget Info',
		settings: [],
	};

	const settings = [widgetInfoCategory, ...data];

	const categories = settings.map((category: WidgetSetting.Category) => {
		return {
			id: category.id,
			label: i18nStringTransform(category.label),
			sections: category.settings
				.filter(setting => {
					return setting.type === 'section';
				})
				.map((section: WidgetSetting.Section) => {
					return { id: section.id, label: i18nStringTransform(section.label) };
				}),
		};
	});

	const topId = useScrollTopObserver(
		topRef,
		categories.reduce<string[]>((ids, category) => {
			const sectionIds = category.sections.map(section => section.id);
			return [...ids, category.id, ...sectionIds];
		}, []),
	);

	if (isLoading) return <p>loading widget settings...</p>;

	if (isError) return <p>error loading widget settings!</p>;

	return (
		<div className='relative row-span-full grid flex-1 grid-cols-8 grid-rows-1 divide-x divide-amber-300 overflow-hidden bg-white'>
			<aside className='col-span-2 gap-2 overflow-y-auto bg-amber-100 text-amber-950'>
				{categories.map(category => {
					return (
						<section
							key={category.id}
							data-active={category.id === topId}
							className='over:bg-amber-300 flex flex-col overflow-hidden py-1 has-[[data-active="true"]]:bg-amber-300 data-[active=true]:bg-amber-300'
						>
							<a
								href={`#${category.id}`}
								className='font-fredoka over:underline px-3 text-xl font-medium uppercase'
							>
								<h3>{category.label}</h3>
							</a>
							{category.sections.length > 0 && (
								<div className='flex flex-col'>
									{category.sections.map(section => {
										return (
											<a
												key={section.id}
												href={`#${section.id}`}
												data-active={section.id === topId}
												className={clsx(
													'font-fredoka over:underline over:before:block relative pl-6 text-lg before:absolute before:left-3.5 before:hidden before:content-["-"] data-[active=true]:before:block',
												)}
											>
												<h4>{section.label}</h4>
											</a>
										);
									})}
								</div>
							)}
						</section>
					);
				})}
			</aside>

			<section className='col-span-6 overflow-y-auto px-4 pb-4' ref={topRef}>
				{settings.map((category: WidgetSetting.Category) => {
					return <CategorySetting key={category.id} {...category} />;
				})}
			</section>
		</div>
	);
});

export default WidgetSettings;
