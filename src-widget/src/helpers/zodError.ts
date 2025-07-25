import { z } from 'zod/v4-mini';

export default function logZodError(error: unknown) {
	console.error(
		error instanceof z.core.$ZodError ? z.prettifyError(error) : error,
	);
}
