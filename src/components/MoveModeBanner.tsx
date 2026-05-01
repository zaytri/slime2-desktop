import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconSrc } from '@/helpers/media';

type MoveModeBannerProps = {
	slotId: string;
	onEscape: VoidFunction;
};

export default function MoveModeBanner({
	slotId,
	onEscape,
}: MoveModeBannerProps) {
	const { tileMeta } = useTileMeta(slotId);

	return (
		<div className='absolute inset-0 z-20 flex items-center justify-center gap-8 bg-black/85 px-4 font-fredoka text-7 font-medium text-white backdrop-blur-xs text-shadow-[0_1px_black]'>
			<div className='flex items-center gap-2'>
				<p>Moving</p>
				<div className='flex items-center gap-2 rounded-2 border-2 border-lime-200 px-2 py-1'>
					<img
						src={getTileIconSrc(slotId, tileMeta.icon)}
						className='max-h-10 max-w-20 rounded-1 object-contain smooth-image'
					/>
					<p className='line-clamp-1 font-mochiy text-5 text-lime-200'>
						{tileMeta.name}
					</p>
				</div>
			</div>

			<div className='flex items-center gap-4'>
				<p className='whitespace-nowrap'>To exit move mode, press</p>
				<button
					type='button'
					className='relative flex overflow-hidden rounded-2 border border-zinc-100 bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:-outline-offset-1! over:outline-lime-600'
					onClick={onEscape}
				>
					<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
					<p className='relative flex-1 text-shadow-[0_1px_3px_#FFFB]'>Esc</p>
				</button>
			</div>
		</div>
	);
}
