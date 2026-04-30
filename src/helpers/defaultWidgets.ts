import ChatBotIcon from '@/assets/icons/bot_chat.png';
import ChatOverlayIcon from '@/assets/icons/overlay_chat.png';

export type DefaultWidget = {
	type: 'bot' | 'overlay';
	name: string;
	icon: string;
	description: string;
};

export type DefaultWidgetId =
	| 'twitch-chat-box'
	| 'twitch-alert-box'
	| 'twitch-event-label'
	| 'twitch-goal-bar'
	| 'twitch-command-bot'
	| 'twitch-timer-bot'
	| 'test';

const defaultWidgets: Record<DefaultWidgetId, DefaultWidget> = {
	'twitch-chat-box': {
		name: 'Chat Box',
		type: 'overlay',
		icon: ChatOverlayIcon,
		description: 'Display chat messages',
	},
	'twitch-alert-box': {
		name: 'Alert Box',
		type: 'overlay',
		icon: ChatOverlayIcon,
		description: 'Display custom alerts for events',
	},
	'twitch-event-label': {
		name: 'Event Label',
		type: 'overlay',
		icon: ChatOverlayIcon,
		description: 'Text display for the latest events',
	},
	'twitch-goal-bar': {
		name: 'Goal Bar',
		type: 'overlay',
		icon: ChatOverlayIcon,
		description: 'Progression bar for a specified goal',
	},
	test: {
		name: 'test',
		type: 'overlay',
		icon: ChatOverlayIcon,
		description: '',
	},
	'twitch-command-bot': {
		name: 'Command Bot',
		type: 'bot',
		icon: ChatBotIcon,
		description: 'Responds to custom chat commands',
	},
	'twitch-timer-bot': {
		name: 'Timer Bot',
		type: 'bot',
		icon: ChatBotIcon,
		description: 'Sends chat messages periodically',
	},
};

export function groupDefaultWidgets() {
	const overlayWidgets = new Map<DefaultWidgetId, DefaultWidget>();
	const botWidgets = new Map<DefaultWidgetId, DefaultWidget>();

	Object.entries(defaultWidgets).forEach(([widgetId, widget]) => {
		if (widget.type === 'overlay') {
			overlayWidgets.set(widgetId as DefaultWidgetId, widget);
		} else if (widget.type === 'bot') {
			botWidgets.set(widgetId as DefaultWidgetId, widget);
		}
	});

	return { overlayWidgets, botWidgets };
}
