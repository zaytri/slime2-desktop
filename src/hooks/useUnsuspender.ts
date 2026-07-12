// attempts to disable background suspension on Windows (maybe also Linux?)

import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';

// context: https://github.com/tauri-apps/tauri/issues/5250#issuecomment-2569380578
// source: https://gist.github.com/bastiankistner/721fbd14cb7dd850f76df0985f394e75

export function useUnsuspender() {
	const [lockId] = useState(() => `prevent-suspense-web-lock-${nanoid()}`);
	const deferred = useRef(promiseWithResolvers());

	const resetDeferred = useCallback(() => {
		deferred.current.resolve();
		deferred.current = promiseWithResolvers();
	}, []);

	useEffect(() => {
		function onVisibilityChange() {
			if (document.hidden) {
				navigator.locks
					.request(lockId, async () => {
						await deferred.current.promise;
					})
					.catch(error => {
						console.error('useUnsuspender: Lock Request Failed', error);
					});
			} else {
				resetDeferred();
			}
		}

		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
			resetDeferred();
		};
	}, [lockId, resetDeferred]);
}

type PromiseWithResolvers = {
	promise: Promise<void>;
	resolve: () => void;
	reject: (reason?: any) => void;
};

function promiseWithResolvers(): PromiseWithResolvers {
	let resolve: PromiseWithResolvers['resolve'];
	let reject: PromiseWithResolvers['reject'];
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve: resolve!, reject: reject! };
}
