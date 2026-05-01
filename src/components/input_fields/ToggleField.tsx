import InputDescription from '@/components/input_fields/InputDescription';
import CheckSvg from '@/components/svg/CheckSvg';
import XSvg from '@/components/svg/XSvg';
import { Field, Label, Switch } from '@headlessui/react';

type ToggleFieldProps = {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	description?: string;
};

export default function ToggleField({
	value,
	onChange,
	label,
	description,
}: ToggleFieldProps) {
	return (
		<Field>
			<Switch
				className='group input-wrapper cursor-pointer items-center justify-between p-2 pr-1 input-wrapper-over'
				checked={value}
				onChange={onChange}
				// allows using arrow keys to toggle the switch
				onKeyDown={event => {
					// only run this on the focused element
					if (document.activeElement !== event.currentTarget) return;

					let newCheckedValue = null;
					if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
						newCheckedValue = true;
					} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
						newCheckedValue = false;
					}

					if (newCheckedValue !== null) {
						event.preventDefault();
						onChange(newCheckedValue);
					}
				}}
			>
				{({ checked }) => (
					<>
						<Label className='flex-1 cursor-pointer text-left font-bold'>
							{label}
						</Label>
						<div className='group mr-1 inline-flex h-7 w-13 cursor-pointer items-center rounded-1 bg-zinc-300 text-zinc-400 transition group-data-checked:bg-lime-600 group-data-checked:text-lime-700'>
							<span className='size-5 translate-x-1 cursor-pointer rounded-0.5 bg-white p-1 shadow transition group-data-checked:translate-x-7'>
								{checked ? (
									<CheckSvg className='size-full' />
								) : (
									<XSvg className='size-full' />
								)}
							</span>
						</div>
					</>
				)}
			</Switch>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
