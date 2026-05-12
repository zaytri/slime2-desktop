import DropdownField from '@/components/input_fields/DropdownField';
import MultiSelectField from '@/components/input_fields/MultiSelectField';
import TextField from '@/components/input_fields/TextField';
import { deepCopyObject } from '@/contexts/common';
import { useDialog } from '@/contexts/dialog/useDialog';
import { capitalizeWord } from '@/helpers/string';
import GenericDeleteDialog from '@@/dialog/GenericDeleteDialog';
import type { WidgetMeta } from '@@/json/widgetMeta';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Fieldset, Input, Legend } from '@headlessui/react';
import { useState } from 'react';

type WidgetMetaEditorProps = {
	value: WidgetMeta;
	onChange: (widgetMeta: WidgetMeta) => void;
};

export default function WidgetMetaEditor({
	value: meta,
	onChange,
}: WidgetMetaEditorProps) {
	return (
		<section className='flex flex-1 flex-col gap-2'>
			<h2 className='px-3 font-mochiy text-4.5 text-white text-shadow-[0_1px_black]'>
				Widget Meta
			</h2>

			<div className='flex flex-1 flex-col overflow-hidden light-container'>
				<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-3'>
					<section className='flex flex-col gap-3 rounded-2 border-2 border-zinc-300 bg-white p-3 outline outline-white'>
						<TextField
							compact
							label='Name'
							placeholder='My Widget'
							value={meta.name}
							onChange={newValue => {
								onChange({
									...meta,
									name: newValue.trim(),
								});
							}}
						/>

						<TextField
							compact
							label='Creator'
							placeholder='My Name'
							value={meta.creator}
							onChange={newValue => {
								onChange({
									...meta,
									creator: newValue.trim(),
								});
							}}
						/>

						<TextField
							compact
							label='Version'
							placeholder='1.0.0'
							value={meta.version}
							onChange={newValue => {
								onChange({
									...meta,
									version: newValue.trim(),
								});
							}}
						/>

						<TextField
							compact
							label='Website'
							placeholder='https://slime2.stream/'
							value={meta.website || ''}
							onChange={newValue => {
								onChange({
									...meta,
									website: newValue.trim(),
								});
							}}
						/>

						<TextField
							compact
							label='Support'
							placeholder='https://forums.slime2.stream/'
							value={meta.support || ''}
							onChange={newValue => {
								onChange({
									...meta,
									support: newValue.trim(),
								});
							}}
						/>

						<MultiSelectField
							label='Type'
							compact
							values={meta.type}
							options={
								[
									{ label: 'Overlay', value: 'overlay' },
									{ label: 'Bot', value: 'bot' },
								] as { label: string; value: WidgetMeta['type'][0] }[]
							}
							onChange={values => {
								onChange({
									...meta,
									type: values,
								});
							}}
						/>
					</section>

					<section className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-3 pt-2 outline outline-white'>
						<div className='flex items-end gap-2'>
							<h3 className='flex-1 font-fredoka text-4.5 font-medium'>
								Accounts
							</h3>

							<button
								type='button'
								className='flex items-center gap-1 rounded-1 bg-zinc-700 px-2 py-0.5 text-white outline -outline-offset-1 outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'
								onClick={() => {
									onChange({
										...meta,
										accounts: [
											...meta.accounts,
											{ type: 'read', service: 'twitch' },
										],
									});
								}}
							>
								<PlusSvg className='mb-px size-2.5' />
								<p className='text-3.5 font-bold'>Add Account</p>
							</button>
						</div>

						<div className='flex flex-col gap-1 rounded-2'>
							{meta.accounts.map((account, index) => {
								return (
									<AccountField
										key={index}
										index={index}
										service={account.service}
										type={account.type}
										onChangeService={service => {
											const newAccounts = deepCopyObject(meta.accounts);
											newAccounts[index]!.service = service;
											onChange({
												...meta,
												accounts: newAccounts,
											});
										}}
										onChangeType={type => {
											const newAccounts = deepCopyObject(meta.accounts);
											newAccounts[index]!.type = type;
											onChange({
												...meta,
												accounts: newAccounts,
											});
										}}
										onDelete={() => {
											const newAccounts = deepCopyObject(meta.accounts);
											newAccounts.splice(index, 1);
											onChange({
												...meta,
												accounts: newAccounts,
											});
										}}
									/>
								);
							})}
						</div>
					</section>

					<Fieldset
						disabled={!meta.type.includes('overlay')}
						className='flex flex-col gap-2 rounded-2 border-2 border-zinc-300 bg-white p-3 pt-2 outline outline-white disabled:cursor-not-allowed disabled:opacity-50'
					>
						<Legend className='font-fredoka text-4.5 font-medium'>
							Overlay Imports
						</Legend>

						<div className='flex flex-col gap-3'>
							<ImportsField
								label='CSS'
								values={meta.import?.css || []}
								onChange={values => {
									onChange({
										...meta,
										import: {
											...meta.import,
											css: values,
										},
									});
								}}
							/>

							<ImportsField
								label='JS'
								values={meta.import?.js || []}
								onChange={values => {
									onChange({
										...meta,
										import: {
											...meta.import,
											js: values,
										},
									});
								}}
							/>
						</div>
					</Fieldset>
				</div>
			</div>
		</section>
	);
}

type ImportsFieldProps = {
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
};

function ImportsField({
	label,
	values,
	onChange,
	placeholder,
}: ImportsFieldProps) {
	const { openDialog } = useDialog();
	const [inputValue, setInputValue] = useState<string>('');

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		onChange(newValues);
	}

	function addValue() {
		const newValue = inputValue.trim();
		if (newValue) {
			onChange([...values, newValue]);
		}

		setInputValue('');
	}

	return (
		<div className='flex flex-col gap-1.5'>
			<div className='relative'>
				<div className='absolute inset-0 flex items-center'>
					<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
				</div>
				<div className='relative flex gap-2'>
					<div className='flex-1'>
						<TextField
							compact
							label={label}
							value={inputValue}
							placeholder={placeholder}
							onChange={setInputValue}
							onEnterKey={addValue}
						/>
					</div>

					<button
						type='button'
						className='flex items-center gap-1 rounded-1 bg-zinc-700 px-2 text-white outline -outline-offset-1 outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'
						onClick={addValue}
					>
						<PlusSvg className='size-2.5' />
						<p className='text-3.5 font-bold'>Add</p>
					</button>
				</div>
			</div>
			<div className='flex flex-col gap-0.5 pl-2'>
				{values.map((value, index) => {
					return (
						<div key={index} className='flex gap-1'>
							<Input
								value={value}
								onChange={event => {
									const newValues = [...values];
									newValues[index] = event.target.value;
									onChange(newValues);
								}}
								autoCorrect='off'
								autoCapitalize='off'
								autoComplete='off'
								aria-autocomplete='none'
								className='flex-1 rounded-1 border border-zinc-800 bg-white px-1.5 py-0.5 pr-1 text-3.5 text-zinc-800 over:outline-3 over:-outline-offset-1! over:outline-lime-600'
							/>

							<button
								type='button'
								className='rounded-1 px-1.5 text-zinc-800 over:bg-rose-800 over:text-white over:outline over:outline-offset-0! over:outline-rose-900'
								onClick={() => {
									if (value.trim()) {
										openDialog(
											'Delete Import',
											<GenericDeleteDialog
												onDelete={() => {
													removeValueAtIndex(index);
												}}
											>
												<div className='flex flex-col gap-2'>
													<p>
														Are you sure you want to{' '}
														<strong>permanently</strong> delete this import?
													</p>
													<p className='rounded-2 border border-zinc-400 bg-white px-2 py-1 text-4 font-bold'>
														{value}
													</p>
												</div>
											</GenericDeleteDialog>,
										);
									} else {
										removeValueAtIndex(index);
									}
								}}
							>
								<XSvg className='size-4' />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

const ACCOUNT_SERVICES: WidgetMeta['accounts'][0]['service'][] = [
	'twitch',
	// 'youtube',
];

const ACCOUNT_TYPES: WidgetMeta['accounts'][0]['type'][] = [
	'read',
	'bot',
	// 'mod',
];

type AccountFieldProps = {
	index: number;
	service: WidgetMeta['accounts'][0]['service'];
	type: WidgetMeta['accounts'][0]['type'];
	onChangeService: (service: WidgetMeta['accounts'][0]['service']) => void;
	onChangeType: (type: WidgetMeta['accounts'][0]['type']) => void;
	onDelete: VoidFunction;
};

function AccountField({
	index,
	service,
	type,
	onChangeService,
	onChangeType,
	onDelete,
}: AccountFieldProps) {
	return (
		<div className='flex gap-1'>
			<Fieldset className='flex w-full items-center gap-2'>
				<Legend className='flex items-center justify-center self-stretch rounded-1 bg-zinc-700 px-2 text-3.5 font-bold whitespace-nowrap text-white outline -outline-offset-1 outline-zinc-800'>
					{index}
				</Legend>

				<div className='flex-1 text-3.5 font-semibold'>
					<DropdownField
						compact
						value={service}
						onChange={onChangeService}
						options={ACCOUNT_SERVICES.map(value => {
							return { label: capitalizeWord(value), value };
						})}
					/>
				</div>
				<div className='flex-1 text-3.5 font-semibold'>
					<DropdownField
						compact
						value={type}
						onChange={onChangeType}
						options={ACCOUNT_TYPES.map(value => {
							return { label: capitalizeWord(value), value };
						})}
					/>
				</div>
			</Fieldset>

			<button
				type='button'
				className='rounded-1 px-1.5 text-zinc-800 over:bg-rose-800 over:text-white over:outline over:outline-offset-0! over:outline-rose-900'
				onClick={onDelete}
			>
				<XSvg className='size-4' />
			</button>
		</div>
	);
}
