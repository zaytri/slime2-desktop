import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockPowerUp from '@/hooks/twitch_mock/useTwitchMockPowerUp';
import SimulateTwitchPowerUpDialog from '@@/dialog/simulate/SimulateTwitchPowerUpDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchPowerUp() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockPowerUp();

	return (
		<SimulateEvent
			label='Custom Power-Up'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Custom Power-Up',
					<SimulateTwitchPowerUpDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
