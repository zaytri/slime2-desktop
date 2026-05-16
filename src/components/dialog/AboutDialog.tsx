import slime2TextImage from '@/assets/slime2text.png';
import slime2TvImage from '@/assets/slime2tv.png';
import useAppVersionQuery from '@/hooks/useAppVersionQuery';
import LinkifyText from '../LinkifyText';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogContent from './DialogContent';

export default function AboutDialog() {
	const appVersionQuery = useAppVersionQuery();

	return (
		<DialogContent className='flex flex-col justify-between gap-4 p-4'>
			<div className='px- flex gap-8'>
				<div className='flex flex-col items-center gap-2'>
					<img alt='' src={slime2TvImage} className='h-50 smooth-image' />
					<img alt='' src={slime2TextImage} className='h-20 smooth-image' />
				</div>

				<LinkifyText
					className='flex flex-1 flex-col gap-2'
					linkClassName='text-green-800 font-medium'
				>
					<h1 className='flex items-baseline gap-1 font-fredoka text-5.5 font-medium text-zinc-800 text-shadow-[0_1px_white]'>
						Slime2
						{appVersionQuery.data && (
							<span className='text-4.5 font-normal text-zinc-500'>
								v{appVersionQuery.data}
							</span>
						)}
					</h1>

					<section className='flex flex-col gap-1 rounded-2 border border-zinc-300 bg-white px-3 py-1'>
						<h2 className='font-fredoka text-4.5 font-medium text-zinc-800 uppercase'>
							Links
						</h2>
						<div className='flex flex-col'>
							{[
								['Website', 'https://slime2.stream/'],
								['Forums', 'https://forums.slime2.stream/'],
								['Source', 'https://github.com/zaytri/slime2-desktop'],
							].map(([label, link]) => {
								return (
									<p key={label} className='text-3.5'>
										{label}: {link}
									</p>
								);
							})}
						</div>
					</section>

					<section className='flex flex-col gap-1 rounded-2 border border-zinc-300 bg-white px-3 py-1'>
						<h2 className='text-4.5 font-bold text-zinc-800 uppercase'>Team</h2>
						<div className='flex flex-col'>
							{[['Zaytri', 'https://zaytri.com/']].map(([label, link]) => {
								return (
									<p key={label} className='text-3.5'>
										{label}: {link}
									</p>
								);
							})}
						</div>
					</section>

					<section className='flex flex-col gap-1 rounded-2 border border-zinc-300 bg-white px-3 py-1'>
						<h2 className='font-fredoka text-4.5 font-medium text-zinc-800 uppercase'>
							Art Credits
						</h2>
						<div className='flex flex-col'>
							{[
								['Logo Designer', 'Bri', 'https://sidequestdesigns.com/'],
								['Icon Artist', 'Anje', 'https://linktr.ee/shenanjegans'],
							].map(([role, name, link]) => {
								return (
									<p key={name} className='text-3.5'>
										{name}: {link} - {role}
									</p>
								);
							})}
						</div>
					</section>
				</LinkifyText>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton actionText='Close' />
			</div>
		</DialogContent>
	);
}
