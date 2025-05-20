import { useDialog } from '@/contexts/dialog/useDialog';
import { startTwitchDeviceCodeFlow } from '@/helpers/twitchAuth';
import { memo, useState } from 'react';
import DialogHeader from './DialogHeader';
import TwitchActivationDialog from './TwitchActivationDialog';

const AddAccountDialog = memo(function AddAccountDialog() {
	const [loading, setLoading] = useState(false);
	const { openDialog } = useDialog();

	return (
		<div>
			<DialogHeader>Add Account</DialogHeader>

			{loading ? (
				<p>loading...</p>
			) : (
				<div>
					<button
						className='rounded-2 bg-amber-500 p-2'
						onClick={() => {
							setLoading(true);

							startTwitchDeviceCodeFlow().then(response => {
								const { device_code, user_code, verification_uri } =
									response.data;

								openDialog(
									<TwitchActivationDialog
										deviceCode={device_code}
										userCode={user_code}
										verificationUri={verification_uri}
									/>,
								);
							});
						}}
					>
						Login with Twitch
					</button>
				</div>
			)}
		</div>
	);
});

export default AddAccountDialog;
