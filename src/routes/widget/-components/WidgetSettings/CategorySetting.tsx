import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import NonCategorySetting from './NonCategorySetting';

const CategorySetting = memo(function CategorySetting(
	category: WidgetSetting.Category,
) {
	return (
		<section>
			<h2 id={category.id} className='text-6 py-2 font-medium'>
				{i18nStringTransform(category.label)}
			</h2>
			<div className='flex flex-col gap-4 pb-4'>
				{category.settings.map(setting => {
					return <NonCategorySetting key={setting.id} {...setting} />;
				})}
			</div>
		</section>
	);
});

export default CategorySetting;
