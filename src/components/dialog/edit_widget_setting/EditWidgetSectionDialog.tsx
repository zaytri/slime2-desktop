import DropdownField from '@/components/input_fields/DropdownField';
import TextField from '@/components/input_fields/TextField';
import { useDialog } from '@/contexts/dialog/useDialog';
import { SECTION_OPTIONS, type WidgetSetting } from '@@/json/widgetSettings';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import UniqueIdField from './UniqueIdField';

type EditWidgetSectionDialogProps = {
	id?: string;
	label?: string;
	type: WidgetSetting.AnySection['type'];
	condition?: WidgetSetting.Condition;
	searchTags?: WidgetSetting.SearchTags;
	onSave: (
		id: string,
		label: string,
		type: WidgetSetting.AnySection['type'],
		condition: WidgetSetting.Condition,
		searchTags: WidgetSetting.SearchTags,
	) => void;
	idExists: (id: string) => boolean;
};

export default function EditWidgetSectionDialog({
	id,
	label,
	type,
	condition,
	searchTags,
	onSave,
	idExists,
}: EditWidgetSectionDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [idError, setIdError] = useState('');
	const [newLabel, setNewLabel] = useState<string>(label || '');
	const [newCondition, setNewCondition] = useState(condition || {});
	const [newSearchTags, setNewSearchTags] = useState(searchTags || []);
	const [newType, setNewType] = useState(type);

	const trimmedId = newId.trim();
	const trimmedLabel = newLabel.trim();
	const disableSave = !trimmedId || !trimmedLabel || !!idError;

	function onChangeId(id: string) {
		setNewId(id);
		setIdError('');
	}

	return (
		<DialogContent className='flex max-h-160 w-160 flex-col justify-between overflow-hidden'>
			<div className='flex flex-col gap-2 overflow-y-auto p-4'>
				<div className='grid flex-1 grid-cols-2 items-start gap-x-4 gap-y-2'>
					<TextField
						label='Label'
						compact
						placeholder='My Section'
						value={newLabel}
						onChange={setNewLabel}
					/>

					<UniqueIdField value={newId} onChange={onChangeId} error={idError} />

					<DropdownField
						label='Type'
						compact
						value={newType}
						onChange={setNewType}
						options={SECTION_OPTIONS}
					/>
				</div>
			</div>

			<div className='flex justify-end gap-4 border-t border-zinc-800 p-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					disabled={disableSave}
					onClick={() => {
						if (disableSave) return;

						// only check if id has been changed
						if (id !== trimmedId && idExists(trimmedId)) {
							setIdError('ID already exists!');
							return;
						}

						onSave(
							trimmedId,
							trimmedLabel,
							newType,
							Object.keys(newCondition).length > 0 ? newCondition : undefined,
							newSearchTags.length > 0 ? newSearchTags : undefined,
						);
						closeDialog();
					}}
				>
					{!id ? 'Add' : 'Update'}
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
