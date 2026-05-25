import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockReward from '@/hooks/twitch_mock/useTwitchMockReward';
import SimulateTwitchRewardDialog from '@@/dialog/simulate/SimulateTwitchRewardDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchReward() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockReward();

	return (
		<SimulateEvent
			label='Channel Point Reward'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Channel Point Reward',
					<SimulateTwitchRewardDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
