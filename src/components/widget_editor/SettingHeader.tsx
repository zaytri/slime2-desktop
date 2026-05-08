import type { WidgetSetting } from '@@/json/widgetSettings';
import clsx from 'clsx';
import SettingTypeTag from '../tag/SettingTypeTag';
import SettingProperty from './SettingProperty';

type SettingHeaderProps = {
	type: WidgetSetting.NonCategory['type'] | 'category';
	label: string;
	id: string;
	hasValues?: boolean;
};

export default function SettingHeader({
	label,
	id,
	type,
	children,
	hasValues,
}: Props.WithChildren<SettingHeaderProps>) {
	const valueClassName = clsx({
		'bg-yellow-50! text-yellow-900!': type === 'category',
		'bg-cyan-50! text-cyan-900!': type === 'section',
		'bg-sky-50! text-blue-900!': type === 'multi-section',
		'text-green-900!':
			type !== 'category' && type !== 'section' && type !== 'multi-section',
	});

	const className = clsx('border-2!', {
		'border-yellow-900! bg-yellow-800!': type === 'category',
		'border-cyan-900! bg-cyan-800!': type === 'section',
		'border-blue-950! bg-blue-900!': type === 'multi-section',
	});

	return (
		<div className='z-1 flex items-start gap-1'>
			<SettingProperty
				label='Label'
				className={clsx('flex-1', hasValues && 'rounded-b-0', className)}
				labelClassName={clsx('py-1! text-3.5!')}
				valueClassName={clsx(
					type === 'text-display'
						? 'font-nunito!'
						: '-mt-0.5 font-fredoka! text-4!',
					valueClassName,
				)}
			>
				{label}
			</SettingProperty>

			<SettingProperty
				label='ID'
				className={clsx(hasValues && 'rounded-b-0', className)}
				labelClassName={clsx('py-1! text-3.5!')}
				valueClassName={clsx('text-3.25! font-bold!', valueClassName)}
				quickSelect
			>
				{id}
			</SettingProperty>

			<SettingTypeTag type={type} />

			{/* menu */}
			{children}
		</div>
	);
}
