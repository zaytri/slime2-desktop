import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockRaid from '@/hooks/twitch_mock/useTwitchMockRaid';
import SimulateTwitchRaidDialog from '@@/dialog/simulate/SimulateTwitchRaidDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchRaid() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockRaid();

	return (
		<SimulateEvent
			label='Raid'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Raid',
					<SimulateTwitchRaidDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
