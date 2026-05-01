import LinkifyText from '@/components/LinkifyText';

type DisplayTextProps = {
	label: string;
};

export default function DisplayText({ label }: DisplayTextProps) {
	return (
		<div className='rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-2 font-medium outline-2 outline-zinc-300'>
			<LinkifyText>{label}</LinkifyText>
		</div>
	);
}
