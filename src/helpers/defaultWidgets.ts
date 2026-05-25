import chatBoxIconImage from '@/assets/icons/slime2_chat_box.png';
import commandBotIconImage from '@/assets/icons/slime2_command_bot.png';
import templateIconImage from '@/assets/icons/slime2_template.png';

export type DefaultWidget = {
	type: 'bot' | 'overlay' | 'template';
	name: string;
	icon: string;
	description: string;
};

export type DefaultWidgetId =
	| 'slime2_overlay_chat_box'
	| 'slime2_overlay_alert_box'
	| 'slime2_overlay_event_label'
	| 'slime2_overlay_goal_bar'
	| 'slime2_bot_commands'
	| 'slime2_bot_timers'
	| 'slime2_template_overlay'
	| 'slime2_template_bot'
	| 'test';

const defaultWidgets: Partial<Record<DefaultWidgetId, DefaultWidget>> = {
	slime2_overlay_chat_box: {
		name: 'Chat Box',
		type: 'overlay',
		icon: chatBoxIconImage,
		description: 'Display chat messages',
	},
	slime2_template_overlay: {
		name: 'Overlay Widget Template',
		type: 'template',
		icon: templateIconImage,
		description: 'Starter overlay template',
	},
	slime2_template_bot: {
		name: 'Bot Widget Template',
		type: 'template',
		icon: templateIconImage,
		description: 'Starter bot template',
	},
	// slime2_alert_box: {
	// 	name: 'Alert Box',
	// 	type: 'overlay',
	// 	icon: AlertBoxIcon,
	// 	description: 'Display custom alerts for events',
	// },
	// slime2_event_label: {
	// 	name: 'Event Label',
	// 	type: 'overlay',
	// 	icon: EventLabelIcon,
	// 	description: 'Text display for the latest events',
	// },
	// 'slime2_goal_bar': {
	// 	name: 'Goal Bar',
	// 	type: 'overlay',
	// 	icon: ChatOverlayIcon,
	// 	description: 'Progression bar for a specified goal',
	// },
	// test: {
	// 	name: 'test',
	// 	type: 'overlay',
	// 	icon: EventLabelIcon,
	// 	description: '',
	// },
	slime2_bot_commands: {
		name: 'Command Bot',
		type: 'bot',
		icon: commandBotIconImage,
		description: 'Replies to custom chat commands',
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
	const templateWidgets = new Map<DefaultWidgetId, DefaultWidget>();

	Object.entries(defaultWidgets).forEach(entry => {
		const [widgetId, widget] = entry as [DefaultWidgetId, DefaultWidget];
		switch (widget.type) {
			case 'bot':
				botWidgets.set(widgetId, widget);
				break;
			case 'overlay':
				overlayWidgets.set(widgetId, widget);
				break;
			case 'template':
				templateWidgets.set(widgetId, widget);
		}
	});

	return { overlayWidgets, botWidgets, templateWidgets };
}
