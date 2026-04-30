import { memo } from 'react';

type SettingSectionProps = {
	id: string;
	label: string;
};

const SettingSection = memo(function SettingSection({
	id,
	label,
	children,
}: Props.WithChildren<SettingSectionProps>) {
	return (
		<section className='rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 outline-2 outline-zinc-300'>
			<h3
				className='rounded-3 px-4 py-2 font-fredoka text-5 font-medium text-shadow-[0_1px_white] focus-visible:outline-4 focus-visible:-outline-offset-6 focus-visible:outline-lime-600'
				tabIndex={0}
				id={id}
			>
				{label}
			</h3>

			<div className='flex flex-col gap-4 p-4 pt-0'>{children}</div>
		</section>
	);
});

export default SettingSection;
