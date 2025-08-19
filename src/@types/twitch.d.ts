namespace Twitch {
	namespace WebsocketMessage {
		type Any = Welcome | KeepAlive | Notification | Reconnect | Revocation;

		type Welcome = {
			metadata: With.WebsocketMetadata<{
				message_type: 'session_welcome';
			}>;
			payload: {
				session: {
					id: string;
					status: 'connected';
					keepalive_timeout_seconds: number;
					reconnect_url: null;
					connected_at: string;
				};
			};
		};

		type KeepAlive = {
			metadata: With.WebsocketMetadata<{
				message_type: 'session_keepalive';
			}>;
			payload: {};
		};

		type Notification = {
			metadata: With.WebsocketMetadata<{
				message_type: 'notification';
				subscription_type: string;
				subscription_version: string;
			}>;
			payload: {
				subscription: {
					id: string;
					status: 'enabled';
					// same as subscription_type/version
					type: string;
					version: string;
					cost: number;
					condition: Record<string, string>;
					transport: {
						method: 'websocket';
						session_id: string;
					};
					created_at: string;
				};
				event: WebsocketEvent.Any;
			};
		};

		type Reconnect = {
			metadata: With.WebsocketMetadata<{
				message_type: 'session_reconnect';
			}>;
			payload: {
				session: {
					id: string;
					status: 'reconnecting';
					keepalive_timeout_seconds: null;
					reconnect_url: string;
					connected_at: string;
				};
			};
		};

		type Revocation = {
			metadata: With.WebsocketMetadata<{
				message_type: 'revocation';
				subscription_type: string;
				subscription_version: string;
			}>;
			payload: {
				subscription: {
					id: string;
					status: 'authorization_revoked' | 'user_removed' | 'version_removed';
					// same as subscription_type/version
					type: string;
					version: string;
					cost: number;
					condition: Record<string, string>;
					transport: {
						method: 'websocket';
						session_id: string;
					};
					created_at: string;
				};
			};
		};
	}

	namespace WebsocketEvent {
		type Any =
			| ChatClear
			| ChatClearUserMessages
			| ChatMessage
			| ChatMessageDelete
			| ChatNotification
			| Follow
			| Raid
			| ShoutoutCreate
			| ChannelPointsAutomaticRedeem
			| ChannelPointsCustomRedeem
			| BitsUse
			| Cheer
			| AdBreakBegin
			| Subscribe
			| SubscriptionGift
			| SubscriptionMessage
			| PollBegin
			| PollProgress
			| PollEnd
			| PredictionBegin
			| PredictionProgress
			| PredictionLock
			| PredictionEnd
			| CharityCampaignStart
			| CharityCampaignProgress
			| CharityCampaignStop
			| CharityDonation
			| GoalBegin
			| GoalProgress
			| GoalEnd
			| HypeTrainBegin
			| HypeTrainProgress
			| HypeTrainEnd;

		// when chat is cleared
		type ChatClear = With.BroadcasterDetails;

		// when a user is banned or timed out
		// need to delete all of their messages
		type ChatClearUserMessages = With.BroadcasterDetails<{
			// target user details
			target_user_id: string;
			target_user_login: string;
			target_user_name: string;
		}>;

		// when a message is sent in chat
		type ChatMessage = With.BroadcasterDetails<{
			// chatter details
			chatter_user_id: string;
			chatter_user_name: string;
			chatter_user_login: string;
			badges: Badge[];
			color: string;

			// message details
			message_id: string;
			message_type:
				| 'text'
				| 'channel_points_highlighted'
				| 'channel_points_sub_only'
				| 'user_intro'
				| 'power_ups_message_effect'
				| 'power_ups_gigantified_emote';
			message: {
				text: string;
				fragments: MessageFragment[];
			};

			// if this message is a cheer
			cheer?: {
				bits: number;
			};

			// if this message is a reply
			reply?: {
				// details of the message being replied to
				parent_message_id: string;
				parent_message_body: string;
				parent_user_id: string;
				parent_user_name: string;
				parent_user_login: string;

				// details of the first message in the reply thread
				thread_message_id: string;
				thread_user_id: string;
				thread_user_name: string;
				thread_user_login: string;
			};

			// if this message is a custom channel point redemption
			channel_points_custom_reward_id?: string;

			// if message is from a shared chat, where the message was sent
			// in a channel other than the broadcaster channel
			is_source_only?: boolean;
			source_message_id?: string;
			source_broadcaster_user_id?: string;
			source_broadcaster_user_name?: string;
			source_broadcaster_user_login?: string;
			source_badges?: Badge[];
		}>;

		// when a single chat message is deleted
		type ChatMessageDelete = With.BroadcasterDetails<{
			// deleted message details
			message_id: string;

			// target user details
			target_user_id: string;
			target_user_login: string;
			target_user_name: string;
		}>;

		// when a chat notification is received, like subscriptions
		type ChatNotification = With.BroadcasterDetails<
			{
				// chatter details
				chatter_user_id: string;
				chatter_user_name: string;
				chatter_is_anonymous: boolean;
				badges: Badge[];
				color: string;

				// what twitch shows in chat separately from the user message
				system_message: string;

				// notice details
				message_id: string;
				message: MessageFragment[];

				// if message is from a shared chat, where the message was sent
				// in a channel other than the broadcaster channel
				source_message_id?: string;
				source_broadcaster_user_id?: string;
				source_broadcaster_user_name?: string;
				source_broadcaster_user_login?: string;
				source_badges?: Badge[];
			} & (
				| {
						notice_type: 'sub';
						sub: ChatNoticeType.Sub;
				  }
				| {
						notice_type: 'shared_chat_sub';
						shared_chat_sub: ChatNoticeType.Sub;
				  }
				| {
						notice_type: 'resub';
						resub: ChatNoticeType.Resub;
				  }
				| {
						notice_type: 'shared_chat_resub';
						shared_chat_resub: ChatNoticeType.Resub;
				  }
				| {
						notice_type: 'sub_gift';
						sub_gift: ChatNoticeType.SubGift;
				  }
				| {
						notice_type: 'shared_chat_sub_gift';
						shared_chat_sub_gift: ChatNoticeType.SubGift;
				  }
				| {
						notice_type: 'community_sub_gift';
						community_sub_gift: ChatNoticeType.CommunitySubGift;
				  }
				| {
						notice_type: 'shared_chat_community_sub_gift';
						shared_chat_community_sub_gift: ChatNoticeType.CommunitySubGift;
				  }
				| {
						notice_type: 'gift_paid_upgrade';
						gift_paid_upgrade: ChatNoticeType.GiftPaidUpgrade;
				  }
				| {
						notice_type: 'shared_chat_gift_paid_upgrade';
						shared_chat_gift_paid_upgrade: ChatNoticeType.GiftPaidUpgrade;
				  }
				| {
						notice_type: 'prime_paid_upgrade';
						prime_paid_upgrade: ChatNoticeType.PrimePaidUpgrade;
				  }
				| {
						notice_type: 'shared_chat_prime_paid_upgrade';
						shared_chat_prime_paid_upgrade: ChatNoticeType.PrimePaidUpgrade;
				  }
				| {
						notice_type: 'raid';
						raid: ChatNoticeType.Raid;
				  }
				| {
						notice_type: 'shared_chat_raid';
						shared_chat_raid: ChatNoticeType.Raid;
				  }
				| {
						notice_type: 'unraid';
						unraid: {};
				  }
				| {
						notice_type: 'pay_it_forward';
						pay_it_forward: ChatNoticeType.PayItForward;
				  }
				| {
						notice_type: 'shared_chat_pay_it_forward';
						shared_chat_pay_it_forward: ChatNoticeType.PayItForward;
				  }
				| {
						notice_type: 'announcement';
						announcement: ChatNoticeType.Announcement;
				  }
				| {
						notice_type: 'shared_chat_announcement';
						shared_chat_announcement: ChatNoticeType.Announcement;
				  }
				| {
						notice_type: 'bits_badge_tier';
						bits_badge_tier: { tier: number };
				  }
				| {
						notice_type: 'charity_donation';
						charity_donation: {
							charity_name: string;
							amount: {
								// in currency's minor unit, such as cents for USD
								value: number;
								// number of decimal places used by currency, such as 2 for USD
								decimal_place: number;
								// ISO-4217 three-letter currency code
								currency: string;
							};
						};
				  }
			)
		>;

		// when a user follows
		type Follow = With.BroadcasterDetails<{
			// follower details
			user_id: string;
			user_login: string;
			user_name: string;

			// RFC3339 timestamp of when the follow occurred
			followed_at: string;
		}>;

		// when bits are used, such as with cheers or power-ups
		type BitsUse = With.BroadcasterDetails<
			{
				// bits user details
				user_id: string;
				user_login: string;
				user_name: string;

				bits: number;

				// if cheer or message_effect power-up
				message?: {
					text: string;
					fragments: MessageFragment[];
				};
			} & {
				type: 'cheer';
			} & {
				type: 'power_up';
				power_up:
					| {
							type: 'celebration' | 'gigantify_an_emote';
							emote: { id: string; name: string };
					  }
					| { type: 'message_effect'; message_effect_id: string };
			}
		>;

		// when a user cheers
		type Cheer = With.BroadcasterDetails<{
			// cheerer details
			is_anonymous: boolean;
			user_id?: string;
			user_login?: string;
			user_name?: string;

			message: string;
			bits: number;
		}>;

		// when a user subscribes
		type Subscribe = With.BroadcasterDetails<{
			// subscriber details
			user_id: string;
			user_login: string;
			user_name: string;

			tier: SubTier;
			is_gift: boolean;
		}>;

		// when a user sends a subscription gift
		type SubscriptionGift = With.BroadcasterDetails<{
			// gifter details
			is_anonymous: boolean;
			user_id?: string;
			user_login?: string;
			user_name?: string;

			total: number;
			tier: SubTier;
			cumulative_total?: number;
		}>;

		// when a user resubscribes
		type SubscriptionMessage = With.BroadcasterDetails<{
			// resubscriber details
			user_id: string;
			user_login: string;
			user_name: string;

			tier: SubTier;
			message: {
				text: string;
				emotes: {
					id: string;
					begin: number;
					end: number;
				}[];
			};

			cumulative_months: number;
			streak_months: number;
			duration_months: number;
		}>;

		// when a broadcaster raids
		type Raid = {
			// raider details
			from_broadcaster_user_id: string;
			from_broadcaster_user_login: string;
			from_broadcaster_user_name: string;

			// raid receiver details
			to_broadcaster_user_id: string;
			to_broadcaster_user_login: string;
			to_broadcaster_user_name: string;

			viewers: number;
		};

		// when an ad break starts
		type AdBreakBegin = With.BroadcasterDetails<{
			// user details who requested the ad (usually broadcaster)
			requester_user_id: string;
			requester_user_login: string;
			requester_user_name: string;

			duration_seconds: number;
			started_at: string; // RFC3339 format
			is_automatic: boolean;
		}>;

		// when an automatic channel point reward is redeemed
		type ChannelPointsAutomaticRedeem = With.BroadcasterDetails<{
			// redeemer details
			user_id: string;
			user_login: string;
			user_name: string;

			id: string;
			redeemed_at: string; // RFC3339 format
			reward: {
				channel_points: number;
			} & {
				type: 'single_message_bypass_sub_mode' | 'send_highlighted_messaage';
			} & {
				type:
					| 'random_sub_emote_unlock'
					| 'chosen_sub_emote_unlock'
					| 'chosen_modified_sub_emote_unlock';
				emote: {
					id: string;
					name: string;
				};
			};

			// if reward type is send_highlighted_message
			// or single_message_bypass_sub_mode
			message?: {
				text: string;
				fragments: MessageFragment[];
			};
		}>;

		// when a custom channel point reward is redeemed
		type ChannelPointsCustomRedeem = With.BroadcasterDetails<{
			// redeemer details
			user_id: string;
			user_login: string;
			user_name: string;

			id: string; // id of the redemption, not the reward
			user_input: string; // empty string if not provided
			status: 'unfulfilled' | 'unknown' | 'fulfilled' | 'canceled';
			redeemed_at: string; // RFC3339 format

			reward: {
				id: string;
				title: string;
				cost: string;
				prompt: string; // reward description
			};
		}>;

		// when a poll begins (may be sent after PollProgress)
		type PollBegin = With.PollDetails;

		// when a poll gets votes
		type PollProgress = With.PollDetails;

		// when a poll ends
		type PollEnd = With.PollDetails<{
			status: 'completed' | 'archived' | 'terminated';
		}>;

		// when a prediction begins (may be sent after PredictionProgress)
		type PredictionBegin = With.PredictionDetails<{
			locks_at: string;
		}>;

		// when a prediction gets channel points
		type PredictionProgress = With.PredictionDetails<{
			locks_at: string;
		}>;

		// when a prediction locks
		type PredictionLock = With.PredictionDetails<{
			locked_at: string;
		}>;

		// when a prediction ends
		type PredictionEnd = With.PredictionDetails<{
			winning_outcome_id: string;
			status: 'resolved' | 'canceled';
			ended_at: string;
		}>;

		// when a charity campaign starts (may be sent after CharityCampaignProgress)
		type CharityCampaignStart = With.CharityCampaignDetails<{
			started_at: string;
		}>;

		// when a charity campaign gains progress
		// or when the fundraising goal is changed
		type CharityCampaignProgress = With.CharityCampaignDetails;

		// when a charity campaign stops
		type CharityCampaignStop = With.CharityCampaignDetails<{
			stopped_at: string;
		}>;

		// when a charity campaign receives a donation
		type CharityDonation = With.CharityDetails<{
			id: string;
			campaign_id: string;

			// donator details
			user_id: string;
			user_login: string;
			user_name: string;

			amount: {
				value: number;
				decimal_places: number;
				currency: string;
			};
		}>;

		// when a goal begins (may be sent after GoalProgress)
		type GoalBegin = With.GoalDetails;

		// when a goal makes progress (positive or negative)
		type GoalProgress = With.GoalDetails;

		// when a goal ends
		type GoalEnd = With.GoalDetails<{
			is_achieved: boolean;
			ended_at: string;
		}>;

		// when a hype train begins (may be sent after HypeTrainProgress)
		type HypeTrainBegin = With.HypeTrainDetails<{
			last_contribution: HypeTrainContribution;
			expires_at: string;
		}>;

		// when a hype train makes progress
		type HypeTrainProgress = With.HypeTrainDetails<{
			last_contribution: HypeTrainContribution;
			expires_at: string;
		}>;

		// when a hype train ends
		type HypeTrainEnd = With.HypeTrainDetails<{
			ended_at: string;
			cooldown_ends_at: string;
		}>;

		type ShoutoutCreate = With.BroadcasterDetails<{
			// broadcaster details who received the shoutout
			to_broadcaster_user_id: string;
			to_broadcaster_user_login: string;
			to_broadcaster_user_name: string;

			// moderator or broadcaster who sent the shoutout
			moderator_user_id: string;
			moderator_user_login: string;
			moderator_user_name: string;

			viewer_count: number;
			started_at: string;
			cooldown_ends_at: string;
			target_cooldown_ends_at: string;
		}>;
	}

	namespace ApiResponse {
		type GetUser = {
			data: {
				id: string;
				login: string;
				display_name: string;
				type: string;
				broadcaster_type: string;
				description: string;
				profile_image_url: string;
				offline_image_url: string;
				created_at: string;
			}[];
		};

		type CreateEventSub = {
			data: {
				id: string;
				status: string;
				type: string;
				version: string;
				condition: Record<string, string>;
				created_at: string;
				transport: {
					method: string;
					session_id: string;
				};
				connected_at: string;
				cost: number;
			}[];
			total: number;
			total_cost: number;
			max_total_cost: number;
		};

		type GetEventSubs = {
			data: {
				id: string;
				status: string;
				type: string;
				version: string;
				condition: Record<string, string>;
				created_at: string;
				transport: {
					method: string;
					session_id: string;
					connected_at: string;
					disconnected_at: string;
				};
				cost: number;
			}[];
			total: number;
			total_cost: number;
			max_total_cost: number;
			pagination: {
				cursor?: string;
			};
		};

		type GetCheermotes = {
			data: {
				prefix: string;
				tiers: {
					min_bits: number;
					id: string;
					color: string;
					images: CheermoteImages;
					can_cheer: boolean;
					show_in_bits_card: boolean;
				}[];
				type:
					| 'global_first_party'
					| 'global_third_party'
					| 'channel_custom'
					| 'display_only'
					| 'sponsored';
				order: number;
				last_updated: string;
				is_charitable: boolean;
			}[];
		};

		type GetBadges = {
			data: {
				set_id: string;
				versions: {
					id: string;
					image_url_1x: string;
					image_url_2x: string;
					image_url_4x: string;
					title: string;
					description: string;
					click_action: string;
					click_url: string;
				}[];
			}[];
		};
	}

	type MessageFragment = {
		text: string;
	} & (
		| { type: 'text' }
		| {
				type: 'cheermote';
				cheermote: {
					prefix: string;
					bits: number;
					tier: number;
				};
		  }
		| {
				type: 'emote';
				emote: {
					id: string;
					emote_set_id: string;
					owner_id: string;
					format: ('static' | 'animated')[];
				};
		  }
		| {
				type: 'mention';
				mention: {
					user_id: string;
					user_name: string;
					user_login: string;
				};
		  }
	);

	type Badge = {
		set_id: string;
		id: string;
		info: string;
	};

	type SubTier = '1000' | '2000' | '3000';

	type HypeTrainContribution = {
		user_id: string;
		user_login: string;
		user_name: string;
		type: 'bits' | 'subscription' | 'other';
		total: number;
	};

	type CheermoteImages = {
		dark: CheermoteTheme;
		light: CheermoteTheme;
	};

	type CheermoteTheme = {
		animated: CheermoteFormat;
		static: CheermoteFormat;
	};

	type CheermoteFormat = {
		'1': string;
		'1.5': string;
		'2': string;
		'3': string;
		'4': string;
	};

	namespace ChatNoticeType {
		type Sub = {
			sub_tier: SubTier;
			is_prime: boolean;
			duration_months: number;
		};

		type Resub = {
			cumulative_months: number;
			duration_months: number;
			streak_months: number;
			sub_tier: SubTier;
			is_prime?: boolean;
			is_gift: boolean;

			// gifter details if is_gift is true
			gifter_is_anonymous?: boolean;
			gifter_user_id?: string;
			gifter_user_name?: string;
			gifter_user_login?: string;
		};

		type SubGift = {
			duration_months: number;
			cumulative_total?: number;

			// recipient details
			recipient_user_id: string;
			recipient_user_name: string;
			recipient_user_login: string;

			sub_tier: SubTier;
			community_gift_id?: string;
		};

		type CommunitySubGift = {
			id: string;
			total: number;
			sub_tier: SubGift;
			cumulative_total?: number;
		};

		type GiftPaidUpgrade = {
			gifter_is_anonymous: boolean;

			// gifter details if not anonymous
			gifter_user_id?: string;
			gifter_user_name?: string;
		};

		type PrimePaidUpgrade = {
			sub_tier: SubTier;
		};

		type Raid = {
			// raider details
			user_id: string;
			user_name: string;
			user_login: string;
			viewer_count: number;
			profile_image_url: string;
		};

		type PayItForward = {
			gifter_is_anonymous: boolean;

			// gifter details if not anonymous
			gifter_user_id?: string;
			gifter_user_name?: string;
			gifter_user_login?: string;
		};

		type Announcement = {
			color: string;
		};
	}

	namespace With {
		type WebsocketMetadata<T = unknown> = T & {
			message_id: string;
			message_timestamp: string;
		};

		type BroadcasterDetails<T = unknown> = T & {
			// broadcaster details
			broadcaster_user_id: string;
			broadcaster_user_login: string;
			broadcaster_user_name: string;
		};

		type PollDetails<T = unknown> = T &
			BroadcasterDetails<{
				id: string;
				title: string;

				choices: {
					id: string;
					title: string;
					bits_votes: number;
					channel_points_votes: number;
					votes: number;
				}[];

				// bits voting doesn't actually get used, will always be disabled
				bits_voting: {
					is_enabled: boolean;
					amount_per_vote: number;
				};

				channel_points_voting: {
					is_enabled: boolean;
					amount_per_vote: number;
				};

				started_at: string;
				ends_at: string;
			}>;

		type PredictionDetails<T = unknown> = T &
			BroadcasterDetails<{
				id: string;
				title: string;
				outcomes: {
					id: string;
					title: string;
					color: 'pink' | 'blue';
					users: number;
					channel_points: number;
					top_predictors: {
						user_id: string;
						user_login: string;
						user_name: string;
						channel_points_won?: number;
						channel_points_used: number;
					}[];
				}[];
				started_at: string;
			}>;

		type CharityDetails<T = unknown> = T &
			BroadcasterDetails<{
				charity_name: string;
				charity_description: string;
				charity_logo: string;
				charity_website: string;
			}>;

		type CharityCampaignDetails<T = unknown> = T &
			CharityDetails<{
				id: string;
				current_amount: {
					value: number;
					decimal_places: number;
					currency: string; // ISO-4217 three-letter currency code
				};
				target_amount: {
					value: number;
					decimal_places: number;
					currency: string;
				};
			}>;

		type GoalDetails<T = unknown> = T &
			BroadcasterDetails<{
				id: string;
				type:
					| 'follow'
					| 'subscription'
					| 'subscription_count'
					| 'new_subscription'
					| 'new_subscription_count'
					| 'new_bit'
					| 'new_cheerer';
				description: string;
				current_amount: number;
				target_amount: number;
				started_at: string;
			}>;

		type HypeTrainDetails<T = unknown> = T &
			BroadcasterDetails<{
				id: string;
				total: number;
				progress: number;
				goal: number;
				level: number;
				top_contributions: HypeTrainContribution[];
				started_at: string;
				is_golden_kappa_train: boolean;
			}>;
	}
}
