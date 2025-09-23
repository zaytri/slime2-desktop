import DialogHeader from '@/components/dialog/DialogHeader';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useSystemFonts } from '@/helpers/query';
import { Checkbox, Field, Input, Label } from '@headlessui/react';
import { memo, useEffect, useRef, useState } from 'react';

type SelectFontDialogProps = {
	value?: string;
	onChange: (font: string) => void;
};

const SelectFontDialog = memo(function SelectFontDialog({
	value,
	onChange,
}: SelectFontDialogProps) {
	const { closeDialog } = useDialog();
	const [search, setSearch] = useState('');
	const { data } = useSystemFonts();
	const scrollRef = useRef<HTMLDivElement>(null);

	// scroll the selected font into view
	useEffect(() => {
		if (!scrollRef.current || !data || !data.length || !value) return;

		const selectedElement = scrollRef.current.querySelector(
			`[data-value="${value}"]`,
		);

		if (selectedElement) {
			selectedElement.scrollIntoView({ block: 'center' });
		}
	}, [value, data]);

	const filteredFonts = data.filter(font =>
		font.toLocaleUpperCase().includes(search.toLocaleUpperCase()),
	);

	return (
		<div>
			<DialogHeader>Select Font</DialogHeader>

			<div className='flex flex-col gap-2'>
				<Field>
					<div className='input-wrapper flex-col'>
						<Label className='input-label'>Font Search</Label>
						<Input
							autoFocus
							placeholder='Search...'
							autoComplete='off'
							aria-autocomplete='none'
							className='input-class'
							onChange={event => {
								setSearch(event.target.value);
							}}
						/>
					</div>
				</Field>

				<div className='rounded-2 flex h-[calc(100vh-250px)] border border-stone-300 bg-white py-1 pr-1 has-focus-visible:outline-2'>
					<div
						className='flex-1 overflow-auto outline-none'
						ref={scrollRef}
						// allows using arrow keys to navigate through the options
						onKeyDown={event => {
							// only run this on this focused element
							if (document.activeElement !== event.currentTarget) return;

							const activeCheckBox =
								event.currentTarget.querySelector('[data-focus]');

							if (event.key === ' ') {
								const newValue = activeCheckBox?.getAttribute('data-value');
								if (newValue) {
									event.preventDefault();
									onChange(newValue);
									closeDialog();
								}
							}

							const parentField = activeCheckBox?.parentElement;

							const fieldToFocus =
								event.key === 'ArrowRight' || event.key === 'ArrowDown'
									? // get the next field
										// or the first field if this is the last field
										(parentField?.nextElementSibling ??
										parentField?.parentElement?.firstElementChild)
									: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
										? // get the previous field
											// or the last field if this is the first field
											(parentField?.previousElementSibling ??
											parentField?.parentElement?.lastElementChild)
										: null;

							const checkboxToFocus = fieldToFocus?.firstElementChild;

							if (checkboxToFocus) {
								event.preventDefault();
								checkboxToFocus.setAttribute('data-focus', '');
								checkboxToFocus.scrollIntoView({
									block: 'center',
								});
								activeCheckBox?.removeAttribute('data-focus');
								// (checkboxToFocus as HTMLElement).focus();
							}
						}}
					>
						{filteredFonts.map(font => {
							return (
								<Field key={font}>
									<Checkbox
										as='div'
										checked={font === value}
										data-focus={font === value ? '' : undefined}
										data-value={font}
										tabIndex={-1}
										className='pl-2 data-checked:bg-lime-600 data-checked:text-white data-over:bg-lime-200 data-over:text-black data-checked:data-over:bg-lime-600 data-checked:data-over:text-white'
										onClick={() => {
											onChange(font);
											closeDialog();
										}}
									>
										<Label style={{ fontFamily: `${font}, sans-serif` }}>
											{font}
										</Label>
									</Checkbox>
								</Field>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
});

export default SelectFontDialog;
