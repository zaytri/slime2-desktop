import DropdownField from '@/components/input_fields/DropdownField';
import NumberField from '@/components/input_fields/NumberField';
import SelectField from '@/components/input_fields/SelectField';
import TextField from '@/components/input_fields/TextField';
import type { WidgetSetting } from '@@/json/widgetSettings';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Fieldset, Legend } from '@headlessui/react';
import { useState } from 'react';

type ValueOption = 'string' | 'number' | 'boolean';
type Condition = { id: string; value: WidgetSetting.OptionValue };

type ConditionFieldProps = {
	value: WidgetSetting.NonCategory['condition'];
	onChange: (
		value: NonUndefined<WidgetSetting.NonCategory['condition']>,
	) => void;
	ids: string[];
};

export default function ConditionField({
	value,
	onChange,
	ids,
}: ConditionFieldProps) {
	const conditions: Condition[] = Object.entries(value || {}).flatMap(
		([conditionId, conditionValue]) => {
			if (Array.isArray(conditionValue)) {
				return conditionValue.map(value => {
					return { id: conditionId, value };
				});
			}
			return { id: conditionId, value: conditionValue };
		},
	);

	const [valueType, setValueType] = useState<ValueOption>(
		conditions.length > 0
			? typeof conditions[conditions.length - 1]?.value === 'number'
				? 'number'
				: typeof conditions[conditions.length - 1]?.value === 'string'
					? 'string'
					: 'boolean'
			: 'boolean',
	);

	const [id, setId] = useState(ids[0]);
	const [valueError, setValueError] = useState('');
	const [text, setText] = useState('');
	const [number, setNumber] = useState<number | null>(null);
	const [boolean, setBoolean] = useState(true);

	function resetInputValue() {
		setText('');
		setNumber(null);
		setBoolean(true);
		setValueError('');
	}

	function onChangeCondition(newConditions: Condition[]) {
		onChange(
			newConditions.reduce<Record<string, WidgetSetting.OptionValue[]>>(
				(conditionObject, condition) => {
					if (!conditionObject[condition.id]) {
						conditionObject[condition.id] = [];
					}
					conditionObject[condition.id]?.push(condition.value);
					return conditionObject;
				},
				{},
			),
		);
	}

	function removeConditionAtIndex(index: number) {
		const newConditions = structuredClone(conditions);
		newConditions.splice(index, 1);
		onChangeCondition(newConditions);
	}

	function addCondition() {
		if (!id) return;

		let error = false;

		const trimmedText = text.trim();
		let newValue: WidgetSetting.OptionValue | null = null;
		if (valueType === 'string' && trimmedText) {
			newValue = trimmedText;
		} else if (valueType === 'number' && number !== null) {
			newValue = number;
		} else if (valueType === 'boolean') {
			newValue = boolean;
		}

		if (newValue === null) {
			setValueError('Value Empty!');
			error = true;
		}

		if (error || newValue === null) return;

		const newValues = structuredClone(conditions);
		onChangeCondition([...newValues, { id, value: newValue }]);
		resetInputValue();
	}

	return (
		<div className='col-span-2 flex flex-col gap-2 py-2'>
			<Fieldset className='relative flex flex-col gap-2'>
				<div className='relative flex justify-between gap-2'>
					<div className='absolute inset-0 flex items-center'>
						<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
					</div>

					<Legend
						as='div'
						className='relative flex flex-1 items-center self-start rounded-1 bg-zinc-700 px-2 py-0.5 font-extrabold whitespace-nowrap text-white outline outline-zinc-800'
					>
						<p>Condition</p>
						<div className='absolute top-full left-1.5'>
							<div className='my-px h-16 w-5 border-x border-zinc-500 bg-zinc-300'></div>
						</div>
					</Legend>

					<div className='flex-1'>
						<DropdownField
							label='Value Type'
							compact
							value={valueType}
							onChange={newValueType => {
								setValueType(newValueType);
								resetInputValue();
							}}
							options={
								[
									{ label: 'String', value: 'string' },
									{ label: 'Number', value: 'number' },
									{ label: 'Boolean', value: 'boolean' },
								] as Option<ValueOption>[]
							}
						/>
					</div>
				</div>

				<div className='relative flex flex-1 flex-col gap-2'>
					<div className='relative'>
						<DropdownField
							label='Dependent ID'
							compact
							placeholder='Select ID...'
							value={id}
							onChange={setId}
							options={ids.map(id => {
								return { label: id, value: id };
							})}
						/>
					</div>

					<div className='relative flex gap-2'>
						<div className='absolute inset-0 flex items-center'>
							<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
						</div>

						<div className='relative flex-1'>
							{valueType === 'string' && (
								<TextField
									label='Dependent Value'
									compact
									placeholder='String'
									value={text}
									onChange={value => {
										setText(value);
										setValueError('');
									}}
									onEnterKey={addCondition}
								/>
							)}

							{valueType === 'number' && (
								<NumberField
									label='Unique Value'
									compact
									placeholder='Number'
									value={number}
									onChange={value => {
										setNumber(value);
										setValueError('');
									}}
									onEnterKey={addCondition}
								/>
							)}

							{valueType === 'boolean' && (
								<SelectField
									label='Unique Value'
									compact
									value={boolean}
									onChange={value => {
										setBoolean(value);
										setValueError('');
									}}
									options={[
										{ label: 'True', value: true },
										{ label: 'False', value: false },
									]}
								/>
							)}

							{valueError && (
								<p className='absolute inset-y-1 right-1 flex items-center rounded-1 bg-rose-900 px-1.5 text-3.5 font-bold text-white outline outline-rose-950'>
									{valueError}
								</p>
							)}
						</div>

						<button
							type='button'
							className='z-5 flex items-center justify-center gap-1 rounded-1 bg-zinc-700 px-2 text-3.5 font-bold text-white outline outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'
							onClick={addCondition}
						>
							<PlusSvg className='size-2.5' />
							<p>Add</p>
						</button>
					</div>
				</div>
			</Fieldset>

			{conditions.length > 0 && (
				<div className='flex flex-col gap-1.5 pl-1'>
					{conditions.map((condition, index) => {
						return (
							<div
								key={`${condition.id}_${condition.value}_${index}`}
								className='flex gap-1'
							>
								<p className='w-6 pt-0.5 text-3.5 font-bold uppercase'>
									{index > 0 ? 'Or' : ''}
								</p>
								<div className='flex flex-1 rounded-1 bg-zinc-700 text-3.5 outline outline-offset-0! outline-zinc-800'>
									<div className='flex flex-1 items-center'>
										<p className='px-2 py-0.5 font-bold text-white'>ID</p>
										<p className='flex flex-1 items-center self-stretch bg-white/75 px-1 font-mono font-bold'>
											{condition.id}
										</p>
									</div>
									<div className='flex flex-1 items-center'>
										<p className='px-2 py-0.5 font-bold text-white'>Value</p>
										<p className='flex flex-1 items-center self-stretch bg-white/75 px-1 font-mono'>
											{JSON.stringify(condition.value)}
										</p>
									</div>
								</div>

								<button
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 over:bg-rose-800 over:text-white over:outline over:outline-offset-0! over:outline-rose-900'
									onClick={() => {
										removeConditionAtIndex(index);
									}}
								>
									<span className='sr-only'>Delete</span>
									<XSvg className='size-4' />
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
