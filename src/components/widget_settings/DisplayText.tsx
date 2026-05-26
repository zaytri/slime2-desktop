import LinkifyText from '@/components/LinkifyText';

type DisplayTextProps = {
	label: string;
};

export default function DisplayText({ label }: DisplayTextProps) {
	return (
		<div className='rounded-2 border-x-8 border-y border-lime-600 bg-lime-200 p-2 font-semibold text-green-950'>
			<LinkifyText linkClassName='text-green-700 font-semibold'>
				{label}
			</LinkifyText>
		</div>
	);
}
