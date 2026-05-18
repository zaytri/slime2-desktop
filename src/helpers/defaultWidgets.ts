import chatBoxIconImage from '@/assets/icons/slime2_chat_box.png';
import templateIconImage from '@/assets/icons/slime2_template.png';

export type DefaultWidget = {
	type: 'bot' | 'overlay' | 'template';
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
	| 'slime2_overlay_template'
	| 'slime2_bot_template'
	| 'test';

const defaultWidgets: Partial<Record<DefaultWidgetId, DefaultWidget>> = {
	slime2_chat_box: {
		name: 'Chat Box',
		type: 'overlay',
		icon: chatBoxIconImage,
		description: 'Display chat messages',
	},
	slime2_overlay_template: {
		name: 'Overlay Widget Template',
		type: 'template',
		icon: templateIconImage,
		description: 'Starter overlay template',
	},
	slime2_bot_template: {
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
	// slime2_command_bot: {
	// 	name: 'Command Bot',
	// 	type: 'bot',
	// 	icon: CommandBotIcon,
	// 	description: 'Responds to custom chat commands',
	// },
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
