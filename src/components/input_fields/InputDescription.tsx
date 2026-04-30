import LinkifyText from '@/components/LinkifyText';
import { Description } from '@headlessui/react';
import { memo } from 'react';

type InputDescriptionProps = {
	id?: string;
};

const InputDescription = memo(function InputDescription({
	children,
	id,
}: Props.WithChildren<InputDescriptionProps>) {
	if (!children) return null;

	const className =
		'text-shadow-[0_1px_#FFF8] text-3.5 px-2 pt-0.5 text-zinc-500';

	if (id) {
		return (
			<LinkifyText id={id} className={className}>
				{children}
			</LinkifyText>
		);
	}

	return (
		<Description as={LinkifyText} className={className}>
			{children}
		</Description>
	);
});

export default InputDescription;
