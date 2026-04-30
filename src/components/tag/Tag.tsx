import clsx from 'clsx';

type TagProps = {
	label: string;
	icon: React.ReactNode;
	mini?: boolean;
};

export default function Tag({
	className,
	label,
	icon,
	mini = false,
}: Props.WithClassName<TagProps>) {
	return (
		<div
			className={clsx(
				'flex items-center gap-1.5 rounded-1 border text-white *:drop-shadow-[0_1px_#0006]',
				mini ? 'px-1.5 py-1' : 'px-2 py-0.5',
				className,
			)}
		>
			{icon}
			<p className={clsx(mini && 'sr-only')}>{label}</p>
		</div>
	);
}
