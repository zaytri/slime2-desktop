import DiceSvg from '@@/svg/DiceSvg';
import GearSvg from '@@/svg/GearSvg';
import clsx from 'clsx';

type SimulateEventProps = {
	label: string;
	onRandom: VoidFunction;
	onCustom: VoidFunction;
};

export default function SimulateEvent({
	label,
	onRandom,
	onCustom,
}: SimulateEventProps) {
	const buttonClassName = clsx(
		'relative flex flex-1 overflow-hidden rounded-2 border border-zinc-100 bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:-outline-offset-1! over:outline-lime-600',
	);

	return (
		<div className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-4 pt-2 outline outline-white has-over:outline-4 has-over:-outline-offset-2 has-over:outline-lime-600'>
			<h2 className='flex items-center justify-between gap-2 font-fredoka text-5.5 font-medium text-shadow-[0_1px_white]'>
				{label}
			</h2>

			<div className='flex gap-4'>
				<button type='button' className={buttonClassName} onClick={onRandom}>
					<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
					<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
						<DiceSvg className='size-5' />
						<p>Random</p>
					</div>
				</button>

				<button type='button' className={buttonClassName} onClick={onCustom}>
					<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
					<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
						<GearSvg className='size-5' />
						<p>Custom</p>
					</div>
				</button>
			</div>
		</div>
	);
}
