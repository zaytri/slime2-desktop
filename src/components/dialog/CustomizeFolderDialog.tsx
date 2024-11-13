import {
	type CustomizeFolderPayload,
	useDialog,
} from '@/contexts/dialog/useDialog';
import { useTile } from '@/contexts/tile_map/useTileMap';
import { tempCopy, tempDelete } from '@/helpers/commands';
import { openImage } from '@/helpers/openFile';
import { Field, Input, Label } from '@headlessui/react';
import { memo, useState } from 'react';
import DialogHeader from './DialogHeader';

export default memo(function CustomizeFolderDialog() {
	const data = useDialog().payload as CustomizeFolderPayload;
	const tile = useTile(data.id);

	const [name, setName] = useState(tile?.name);
	const [icon, setIcon] = useState(tile?.icon);
	const [color, setColor] = useState(tile?.color);

	return (
		<div>
			<DialogHeader>Customize Folder</DialogHeader>
			<Field>
				<Label>Name</Label>
				<Input
					type='text'
					value={name}
					onChange={event => {
						setName(event.target.value);
					}}
					className='rounded-full border-2 border-slate-600 bg-gradient-to-b from-slate-200 to-white'
				/>
			</Field>
			<button
				type='button'
				onClick={async () => {
					const filePath = await openImage();
					if (!filePath) return;

					// delete previous temp copy
					if (icon) tempDelete(icon);

					// create new temp copy
					const fileName = await tempCopy(filePath);

					setIcon(fileName);
				}}
			>
				boop
			</button>

			{icon && (
				<img
					src={`http://localhost:57140/preview/${icon}`}
					className='size-20'
				/>
			)}
		</div>
	);
});
