import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockChatMessage from '@/hooks/twitch_mock/useTwitchMockChatMessage';
import SimulateTwitchChatMessageDialog from '@@/dialog/simulate/SimulateTwitchChatMessageDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchChatMessage() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockChatMessage();

	return (
		<SimulateEvent
			label='Chat Message'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Chat Message',
					<SimulateTwitchChatMessageDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
