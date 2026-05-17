import useBotLogs from './useBotLogs';
import { useBotsLogDispatch } from './useBotLogsDispatch';

export default function useBotLog(widgetId: string) {
	const botLogs = useBotLogs();
	const { addBotLog, clearBotLog } = useBotsLogDispatch();

	const addLog = (log: string) => {
		addBotLog(widgetId, log);
	};

	const clearLog = () => {
		clearBotLog(widgetId);
	};

	return { botLog: botLogs[widgetId] || [], addLog, clearLog };
}
