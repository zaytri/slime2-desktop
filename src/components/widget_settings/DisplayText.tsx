import LinkifyText from '@/components/LinkifyText';

type DisplayTextProps = {
	label: string;
};

export default function DisplayText({ label }: DisplayTextProps) {
	return (
		<div className='rounded-2 border border-zinc-800 bg-zinc-700 p-2 font-medium text-white text-shadow-[0_1px_black]'>
			<LinkifyText linkClassName='text-green-300 font-semibold'>
				{label}
			</LinkifyText>
		</div>
	);
}
