import LinkifyText from '@/components/LinkifyText';

type DisplayTextProps = {
	label: string;
};

export default function DisplayText({ label }: DisplayTextProps) {
	return (
		<div className='rounded-2 border-2 border-zinc-600 bg-white p-2 font-medium'>
			<LinkifyText linkClassName='text-green-700 font-semibold'>
				{label}
			</LinkifyText>
		</div>
	);
}
