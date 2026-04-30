import { usePage } from '@/contexts/pages/usePage';
import CubeSvg from '@@/svg/CubeSvg';
import GridSvg from '@@/svg/GridSvg';
import { CreateTilePages } from '.';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function CreateStartPage() {
	const { setPage } = usePage<CreateTilePages>();

	return (
		<div className='flex flex-1 flex-col justify-between gap-6 pt-2'>
			<div className='flex flex-col gap-4'>
				<DialogConfirmButton
					icon={<CubeSvg className='size-5.5' />}
					onClick={() => {
						setPage('widgets');
					}}
				>
					New Widget
				</DialogConfirmButton>

				<DialogConfirmButton
					icon={<GridSvg className='size-5.5' />}
					onClick={() => {
						setPage('folder');
					}}
				>
					New Folder
				</DialogConfirmButton>
			</div>

			<div className='flex justify-end'>
				<DialogCancelButton />
			</div>
		</div>
	);
}
