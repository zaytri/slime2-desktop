import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockRedeem from '@/hooks/twitch_mock/useTwitchMockRedeem';
import SimulateTwitchRedeemDialog from '@@/dialog/simulate/SimulateTwitchRedeemDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchRedeem() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockRedeem();

	return (
		<SimulateEvent
			label='Channel Point Reward'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Channel Point Reward',
					<SimulateTwitchRedeemDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
