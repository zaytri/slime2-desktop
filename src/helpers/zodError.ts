import { z } from 'zod/mini';

export default function logZodError(error: unknown, data: unknown) {
	if (error instanceof z.core.$ZodError) {
		const formattedError = z.prettifyError(error);

		console.error(formattedError, '\n', 'Data: ', data, '\n', error);
		return formattedError;
	} else {
		console.error(error, '\n', 'Data: ', data);
		return error;
	}
}
