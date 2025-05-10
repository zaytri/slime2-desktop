import LinkifyText from '@/components/LinkifyText';
import { I18nString, i18nStringTransform } from '@/helpers/i18n';
import { Description } from '@headlessui/react';
import { memo } from 'react';

type InputDescriptionProps = {
	value?: I18nString;
	id?: string;
};

const InputDescription = memo(function InputDescription({
	value,
	id,
}: InputDescriptionProps) {
	if (!value) return null;

	const description = i18nStringTransform(value);
	const className = 'text-3.5 font-quicksand px-2 pt-1 text-stone-500';

	if (id) {
		return (
			<LinkifyText id={id} className={className}>
				{description}
			</LinkifyText>
		);
	}

	return (
		<Description as={LinkifyText} className={className}>
			{description}
		</Description>
	);
});

export default InputDescription;
