import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockSubscription from '@/hooks/twitch_mock/useTwitchMockSubscription';
import SimulateTwitchSubscriptionDialog from '@@/dialog/simulate/SimulateTwitchSubscriptionDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchSubscription() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockSubscription();

	return (
		<SimulateEvent
			label='Subscription'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Subscription',
					<SimulateTwitchSubscriptionDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
