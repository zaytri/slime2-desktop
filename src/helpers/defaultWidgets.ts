import AlertBoxIcon from '@/assets/icons/slime2_alert_box.png';
import ChatBoxIcon from '@/assets/icons/slime2_chat_box.png';
import CommandBotIcon from '@/assets/icons/slime2_command_bot.png';
import EventLabelIcon from '@/assets/icons/slime2_event_label.png';

export type DefaultWidget = {
	type: 'bot' | 'overlay';
	name: string;
	icon: string;
	description: string;
};

export type DefaultWidgetId =
	| 'slime2_chat_box'
	| 'slime2_alert_box'
	| 'slime2_event_label'
	| 'slime2_goal_bar'
	| 'slime2_command_bot'
	| 'slime2_timer_bot'
	| 'test';

const defaultWidgets: Partial<Record<DefaultWidgetId, DefaultWidget>> = {
	slime2_chat_box: {
		name: 'Chat Box',
		type: 'overlay',
		icon: ChatBoxIcon,
		description: 'Display chat messages',
	},
	slime2_alert_box: {
		name: 'Alert Box',
		type: 'overlay',
		icon: AlertBoxIcon,
		description: 'Display custom alerts for events',
	},
	slime2_event_label: {
		name: 'Event Label',
		type: 'overlay',
		icon: EventLabelIcon,
		description: 'Text display for the latest events',
	},
	// 'slime2_goal_bar': {
	// 	name: 'Goal Bar',
	// 	type: 'overlay',
	// 	icon: ChatOverlayIcon,
	// 	description: 'Progression bar for a specified goal',
	// },
	// test: {
	// 	name: 'test',
	// 	type: 'overlay',
	// 	icon: ChatOverlayIcon,
	// 	description: '',
	// },
	slime2_command_bot: {
		name: 'Command Bot',
		type: 'bot',
		icon: CommandBotIcon,
		description: 'Responds to custom chat commands',
	},
	// 'slime2_timer_bot': {
	// 	name: 'Timer Bot',
	// 	type: 'bot',
	// 	icon: ChatBotIcon,
	// 	description: 'Sends chat messages periodically',
	// },
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
