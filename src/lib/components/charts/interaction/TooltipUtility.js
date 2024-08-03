import { writable } from 'svelte/store';

export const initializeToolTip = () => {
	const initialState = {
		active: false,
		label: 'Boogie',
		body: 'Woogie',
		position: { top: 0, left: 0 }
	};
	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,
		enable: (position, body, label) => {
			update((state) => {
				return { ...state, active: true, position, body, label };
			});
		},
		disable: () => {
			update((state) => ({ ...state, active: false }));
		},
		reset: () => {
			set(initialState);
		}
	};
};
