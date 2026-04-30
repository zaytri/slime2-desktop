import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockFollow from '@/hooks/twitch_mock/useTwitchMockFollow';
import SimulateTwitchFollowDialog from '@@/dialog/simulate/SimulateTwitchFollowDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchFollow() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockFollow();

	return (
		<SimulateEvent
			label='Follow'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Follow',
					<SimulateTwitchFollowDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
