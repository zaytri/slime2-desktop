import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockCheer from '@/hooks/twitch_mock/useTwitchMockCheer';
import SimulateTwitchCheerDialog from '@@/dialog/simulate/SimulateTwitchCheerDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchCheer() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockCheer();

	return (
		<SimulateEvent
			label='Cheer'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Cheer',
					<SimulateTwitchCheerDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
