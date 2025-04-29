import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import NonCategorySetting from './NonCategorySetting';

const SectionSetting = memo(function SectionSetting(
	setting: WidgetSetting.Section,
) {
	return (
		<section className='rounded-2 border border-amber-300 px-4 pb-4'>
			<h3 id={setting.id} className='text-5 py-2 font-medium'>
				{i18nStringTransform(setting.label)}
			</h3>
			<div className='flex flex-col gap-4'>
				{setting.settings.map(setting => {
					return <NonCategorySetting key={setting.id} {...setting} />;
				})}
			</div>
		</section>
	);
});

export default SectionSetting;
