import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import NonCategorySettings from './NonCategorySettings';

const CategorySetting = memo(function CategorySetting({
	id,
	label,
	settings,
	children,
}: Props.WithChildren<Props.WithId<WidgetSetting.Category>>) {
	return (
		<section className='border-t border-stone-300'>
			<h2 id={id} className='text-6 top-0 bg-stone-200 px-4 py-2 font-medium'>
				{i18nStringTransform(label)}
			</h2>

			<div className='flex flex-col gap-4 border-t border-stone-300 p-4 inset-shadow-sm'>
				{children || <NonCategorySettings settings={settings} />}
			</div>
		</section>
	);
});

export default CategorySetting;
