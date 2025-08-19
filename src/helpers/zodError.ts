import { z } from 'zod/mini';

export default function logZodError(error: unknown) {
	const formattedError =
		error instanceof z.core.$ZodError ? z.prettifyError(error) : error;
	console.error(formattedError);
	return formattedError;
}
