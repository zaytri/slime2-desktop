import { useDialog } from '@/contexts/dialog/useDialog';
import { startTwitchDeviceCodeFlow } from '@/helpers/twitchAuth';
import { memo, useState } from 'react';
import DialogHeader from './DialogHeader';

const AddAccountDialog = memo(function AddAccountDialog() {
	const [loading, setLoading] = useState(false);
	const { open } = useDialog();

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
								open({
									name: 'TwitchActivation',
									payload: {
										deviceCode: response.data.device_code,
										userCode: response.data.user_code,
										verificationUri: response.data.verification_uri,
									},
								});
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
