import NumberField from '@/components/input_fields/NumberField';
import CheckSvg from '@@/svg/CheckSvg';
import { Checkbox, Field, Label } from '@headlessui/react';

type StepFieldProps = {
	value?: number | 'any';
	onChange: (value: number | 'any' | null) => void;
};

export default function StepField({ value, onChange }: StepFieldProps) {
	return (
		<div className='relative'>
			<div className='absolute inset-0 flex items-center'>
				<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
			</div>
			<div className='relative flex items-center gap-2'>
				<NumberField
					compact
					disabled={value === 'any'}
					label='Step (Interval)'
					value={value === 'any' || value === undefined ? null : value}
					onChange={onChange}
				/>

				<Field className='flex self-stretch'>
					<Checkbox
						className='group/check flex flex-1 items-center rounded-1 bg-white px-2 py-0.5 outline outline-zinc-800 data-over:bg-lime-200 data-over:outline-2 data-over:outline-lime-600'
						checked={value === 'any'}
						onChange={newCheckedValue => {
							onChange(newCheckedValue ? 'any' : null);
						}}
					>
						<Label className='flex cursor-pointer items-center gap-1 text-3.5 font-semibold select-none'>
							<div className='flex items-center justify-center rounded-1 border-2 border-zinc-700 bg-white p-0.5 group-data-checked/check:bg-zinc-700!'>
								<CheckSvg className='size-3 text-transparent group-data-checked/check:text-white' />
							</div>
							<p className='-mb-px'>Any</p>
						</Label>
					</Checkbox>
				</Field>
			</div>
		</div>
	);
}
