import { useDialog } from '@/contexts/dialog/useDialog';
import { usePageContext } from '@/contexts/pages/usePageContext';
import { WidgetValues, WidgetValuesParser } from '@@/json/widgetValues';
import { Description, Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';
import { useState } from 'react';
import type { CopyPasteWidgetDataContext } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function PasteWidgetDataPage() {
	const [jsonString, setJsonString] = useState('');
	const { replace } = usePageContext<CopyPasteWidgetDataContext>();
	const { closeDialog } = useDialog();

	const trimmedJsonString = jsonString.trim();
	const isEmpty = trimmedJsonString === '';
	const json = validateJson(trimmedJsonString);
	const isInvalid = !isEmpty && json === null;

	return (
		<div className='flex w-150 flex-1 flex-col justify-between gap-6'>
			<Field
				aria-invalid={isInvalid}
				className='group/field flex flex-col gap-4'
			>
				<div
					className={clsx(
						'input-wrapper flex-col gap-1 p-2',
						isInvalid
							? 'has-focus-visible:outline-rose-800! over:outline-4 over:-outline-offset-2! over:outline-rose-800!'
							: 'input-wrapper-over',
					)}
				>
					<Label className='input-label'>Paste Here</Label>

					<Textarea
						value={jsonString}
						onChange={event => {
							setJsonString(event.target.value);
						}}
						className='rounded-1 border border-zinc-200 bg-zinc-50 p-2 font-mono text-3.5 font-bold input-class text-zinc-800'
						autoFocus
						autoComplete='off'
						aria-autocomplete='none'
						rows={10}
						spellCheck={false}
					/>

					{isInvalid && (
						<p className='text-right text-3.5 font-bold text-rose-900'>
							Invalid Data JSON!
						</p>
					)}
				</div>

				<Description
					as='div'
					className='flex gap-1 rounded-2 border-2 border-rose-800 bg-rose-100 p-2 text-3.5 text-rose-900'
				>
					<strong className=''>Note:</strong>
					<p>
						This will <strong>permanently replace</strong> this widget's data.
					</p>
				</Description>

				<Description
					as='div'
					className='flex gap-1 rounded-2 border-2 border-amber-800 bg-yellow-100 p-2 text-3.5 text-amber-900'
				>
					<strong className=''>Note 2:</strong>
					<p>
						Any local media (images, video, audio) used will be broken and need
						replacement.
					</p>
				</Description>
			</Field>

			<div className='flex justify-end gap-4'>
				<DialogConfirmButton
					disabled={isEmpty || json === null}
					onClick={() => {
						if (isEmpty || json === null) return;

						replace(json);
						closeDialog();
					}}
				>
					Save
				</DialogConfirmButton>
			</div>
		</div>
	);
}

function validateJson(json: string): WidgetValues | null {
	try {
		return WidgetValuesParser.parse(JSON.parse(json));
	} catch (error) {
		return null;
	}
}
