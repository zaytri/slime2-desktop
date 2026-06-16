type DisplayHeadingProps = {
	label: string;
};

export default function DisplayHeading({ label }: DisplayHeadingProps) {
	return (
		<h5 className='my-1 border-b border-zinc-300 pb-1.5 font-mochiy'>
			{label}
		</h5>
	);
}
