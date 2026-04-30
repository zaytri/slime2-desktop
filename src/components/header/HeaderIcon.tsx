type HeaderIconProps = {
	src?: string;
};

export default function HeaderIcon({ src }: HeaderIconProps) {
	if (!src) return null;

	return (
		<img
			src={src}
			className='-my-2 max-h-14 max-w-24 rounded-1 object-contain smooth-image'
		/>
	);
}
