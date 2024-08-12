import { writable } from 'svelte/store';

export const initializeToolTip = () => {
	const initialState = {
		active: false,
		position: { top: 0, left: 0 }
	};
	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,
		enable: (position) => {
			update((state) => {
				return { ...state, active: true, position };
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
