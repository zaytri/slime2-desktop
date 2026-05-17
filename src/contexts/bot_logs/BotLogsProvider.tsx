import { useReducer } from 'react';
import { BotLogsContext } from './useBotLogs';
import { BotLogsDispatchContext, botLogsReducer } from './useBotLogsDispatch';

export default function BotLogsProvider({ children }: Props.WithChildren) {
	const [botLogs, dispatch] = useReducer(botLogsReducer, {});

	return (
		<BotLogsContext value={botLogs}>
			<BotLogsDispatchContext value={dispatch}>
				{children}
			</BotLogsDispatchContext>
		</BotLogsContext>
	);
}
