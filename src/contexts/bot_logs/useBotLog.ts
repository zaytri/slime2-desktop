import useBotLogs from './useBotLogs';
import { useBotsLogDispatch, type BotLogLevel } from './useBotLogsDispatch';

export default function useBotLog(widgetId: string) {
	const botLogs = useBotLogs();
	const { addBotLog, clearBotLog } = useBotsLogDispatch();

	const addLog = (data: unknown[], level?: BotLogLevel) => {
		addBotLog(widgetId, data, level);
	};

	const clearLog = () => {
		clearBotLog(widgetId);
	};

	return { botLog: botLogs[widgetId] || [], addLog, clearLog };
}
