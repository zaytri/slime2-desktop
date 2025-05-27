import { getTokens, loadAccounts } from '@/helpers/json/accounts';
import axios from 'axios';
import { memo, useEffect, useReducer } from 'react';
import { AccountsContext } from './useAccounts';
import {
	AccountsDispatchContext,
	accountsReducer,
} from './useAccountsDispatch';

const AccountsProvider = memo(function AccountsProvider({
	children,
}: Props.WithChildren) {
	const [accounts, dispatch] = useReducer(accountsReducer, {});

	useEffect(() => {
		async function getAccounts() {
			const accounts = await loadAccounts();
			dispatch({ type: 'set', accounts });
		}

		getAccounts();
	}, []);

	useEffect(() => {
		const websockets: WebSocket[] = [];

		Object.values(accounts).forEach(account => {
			if (account.service === 'twitch' && account.type === 'read') {
				console.log('connecting...', account.displayName);
				const websocket = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

				console.log('here??');

				websocket.addEventListener('message', async message => {
					const data = JSON.parse(message.data);

					if (data.metadata.message_type === 'session_welcome') {
						const sessionId = data.payload.session.id;
						console.log('welcome', sessionId);

						const tokens = await getTokens(account.id);
						if (!tokens) return;

						[
							{
								type: 'channel.bits.use',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.follow',
								version: 2,
								condition: {
									broadcaster_user_id: account.serviceId,
									moderator_user_id: account.serviceId,
								},
							},

							{
								type: 'channel.ad_break.begin',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.chat.clear',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									user_id: account.serviceId,
								},
							},

							{
								type: 'channel.chat.clear_user_messages',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									user_id: account.serviceId,
								},
							},

							{
								type: 'channel.chat.message',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									user_id: account.serviceId,
								},
							},

							{
								type: 'channel.chat.message_delete',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									user_id: account.serviceId,
								},
							},

							{
								type: 'channel.chat.notification',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									user_id: account.serviceId,
								},
							},

							{
								type: 'channel.subscribe',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.subscription.gift',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.subscription.message',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.cheer',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.raid',
								version: 1,
								condition: {
									to_broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.channel_points_automatic_reward_redemption.add',
								version: 2,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},

							{
								type: 'channel.channel_points_custom_reward_redemption.add',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},

							{
								type: 'channel.poll.begin',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.poll.progress',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.poll.end',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.prediction.begin',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.prediction.progress',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.prediction.lock',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.prediction.end',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.charity_campaign.donate',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.charity_campaign.start',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.charity_campaign.progress',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.charity_campaign.stop',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.goal.begin',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.goal.progress',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.goal.end',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.hype_train.begin',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.hype_train.progress',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.hype_train.end',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
								},
							},
							{
								type: 'channel.shoutout.create',
								version: 1,
								condition: {
									broadcaster_user_id: account.serviceId,
									moderator_user_id: account.serviceId,
								},
							},
						].forEach(subscription => {
							const { type, version, condition } = subscription;
							axios
								.post(
									'https://api.twitch.tv/helix/eventsub/subscriptions',
									{
										type,
										version: version.toString(),
										condition,
										transport: {
											method: 'websocket',
											session_id: sessionId,
										},
									},
									{
										headers: {
											Authorization: `Bearer ${tokens.accessToken}`,
											'Client-Id': 'x94joq8r5wtpajvpdmc95gh03wu6ur',
										},
									},
								)
								.then(response => {
									const data = response.data;
									console.log(data.total, data.total_cost, data.max_total_cost);
								})
								.catch(error => {
									console.error(subscription, error);
								});
						});
					} else {
						console.log(data.metadata.message_type, data);
					}
				});

				websocket.addEventListener('close', event => {
					console.log('websocket closed', event);
				});

				websockets.push(websocket);
			}
		});

		return () => {
			console.log('disconnecting...');
			websockets.forEach(websocket => {
				websocket.close();
			});
		};
	}, [accounts]);

	return (
		<AccountsContext value={accounts}>
			<AccountsDispatchContext value={dispatch}>
				{children}
			</AccountsDispatchContext>
		</AccountsContext>
	);
});

export default AccountsProvider;
