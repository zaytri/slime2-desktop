import clsx from 'clsx';

type SettingPropertyProps = {
	label: string;
	labelClassName?: string;
	valueClassName?: string;
	quickSelect?: boolean;
};

export default function SettingProperty({
	label,
	children,
	className,
	labelClassName,
	valueClassName,
	quickSelect = false,
}: Props.WithClassNameAndChildren<SettingPropertyProps>) {
	return (
		<div
			className={clsx(
				'flex items-stretch overflow-hidden rounded-1 border border-green-900 bg-green-800',
				className,
			)}
		>
			<p
				className={clsx(
					'flex px-1.5 pt-0.5 text-3.25 font-semibold text-white',
					labelClassName,
				)}
			>
				{label}
			</p>
			<div
				className={clsx(
					'flex flex-1 items-center bg-green-50 px-1.5 font-mono text-3.5 font-medium text-zinc-800',
					valueClassName,
				)}
				onClick={event => {
					if (quickSelect) {
						getSelection()?.selectAllChildren(event.currentTarget);
					}
				}}
			>
				{children}
			</div>
		</div>
	);
}
