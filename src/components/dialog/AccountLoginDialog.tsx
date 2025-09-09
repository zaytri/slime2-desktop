import { useDialog } from '@/contexts/dialog/useDialog';
import { Account } from '@/helpers/json/accounts';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { memo, useState } from 'react';
import TwitchIconSvg from '../svg/TwitchIconSvg';
import DialogHeader from './DialogHeader';
import TwitchActivationDialog from './TwitchActivationDialog';

type AccountLoginDialogProps = {
	accountType: Account['type'];
};

const AccountLoginDialog = memo(function AccountLoginDialog({
	accountType,
}: AccountLoginDialogProps) {
	const [loading, setLoading] = useState(false);
	const { openDialog } = useDialog();

	return (
		<div className=''>
			<DialogHeader>Account Login</DialogHeader>

			{loading ? null : (
				<div className='pt-5'>
					<button
						className='rounded-2 bg-[#9146FF] font-radio-canada text-5 p-3 text-white flex gap-2 items-center w-full justify-center group over:translate-y-0.5 over:bg-none over:shadow-none border-2 border-violet-900 bg-linear-to-b from-[#9146FF] to-violet-600 from-50% to-50% shadow-[0_2px] shadow-violet-900'
						onClick={() => {
							setLoading(true);

							twitchAuth.startDCF(accountType).then(response => {
								const { device_code, user_code, verification_uri } =
									response.data;

								openDialog(
									<TwitchActivationDialog
										deviceCode={device_code}
										userCode={user_code}
										verificationUri={verification_uri}
										accountType={accountType}
									/>,
								);
							});
						}}
					>
						<TwitchIconSvg className='size-6' />
						Twitch
					</button>
				</div>
			)}
		</div>
	);
});

export default AccountLoginDialog;
