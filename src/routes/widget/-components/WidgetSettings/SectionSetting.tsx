import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import NonCategorySettings from './NonCategorySettings';

const SectionSetting = memo(function SectionSetting({
	id,
	label,
	settings,
}: Props.WithId<WidgetSetting.Section>) {
	return (
		<section className='rounded-2 border border-white bg-stone-100 outline outline-stone-300'>
			<h3
				id={id}
				className='text-5 scroll-mt-4 border-b border-white px-4 py-2 font-medium'
			>
				{i18nStringTransform(label)}
			</h3>

			<div className='flex flex-col gap-4 border-t border-stone-300 p-4 inset-shadow-sm'>
				<NonCategorySettings settings={settings} />
			</div>
		</section>
	);
});

export default SectionSetting;
