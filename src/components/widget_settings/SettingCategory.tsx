import { I18nString, i18nStringTransform } from '@/helpers/i18n';

type SettingCategoryProps = {
	id: string;
	label: I18nString;
};

export default function SettingCategory({
	id,
	label,
	children,
}: Props.WithChildren<SettingCategoryProps>) {
	return (
		<section>
			<h2
				className='-mx-2 rounded-2 px-2 font-mochiy text-5.5 text-zinc-800 text-shadow-[0_1px_white] focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-lime-600'
				tabIndex={0}
				id={id}
			>
				{i18nStringTransform(label)}
			</h2>

			<div className='flex flex-col gap-4 pt-2'>{children}</div>
		</section>
	);
}
