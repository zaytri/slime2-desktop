import { z } from 'zod/mini';

export default function logZodError(error: unknown) {
	console.error(
		error instanceof z.core.$ZodError ? z.prettifyError(error) : error,
	);
}
