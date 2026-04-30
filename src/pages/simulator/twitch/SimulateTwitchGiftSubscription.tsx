import { useDialog } from '@/contexts/dialog/useDialog';
import useTwitchMockGiftSubscription from '@/hooks/twitch_mock/useTwitchMockGiftSubscription';
import SimulateTwitchGiftSubscriptionDialog from '@@/dialog/simulate/SimulateTwitchGiftSubscriptionDialog';
import SimulateEvent from '../SimulateEvent';

export default function SimulateTwitchGiftSubscription() {
	const { openDialog } = useDialog();
	const { sendCustom, sendRandom } = useTwitchMockGiftSubscription();

	return (
		<SimulateEvent
			label='Gift Subscription'
			onRandom={sendRandom}
			onCustom={() => {
				openDialog(
					'Simulate Gift Subscription',
					<SimulateTwitchGiftSubscriptionDialog onSend={sendCustom} />,
				);
			}}
		/>
	);
}
