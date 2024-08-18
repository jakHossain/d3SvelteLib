import { writable } from 'svelte/store';

const initialState = {
	svgContainer: null,
	chartContainer: null,
	data: null,
	chartTitle: '',
	chartDeck: ''
};

export const initChartData = () => {
	const { subscribe, set, update } = writable(initialState);

	const chartStateDispatch = {
		reset: () => {
			set(initialState);
		},
		setChartTitle: (title) => {
			update((state) => {
				return { ...state, chartTitle: title };
			});
		},
		setChartDeck: (deck) => {
			update((state) => {
				return { ...state, chartDeck: deck };
			});
		},
		setSvgContainer: (svgElement) => {
			update((state) => {
				return { ...state, svgContainer: svgElement };
			});
		},
		setChartContainer: (chartElement) => {
			update((state) => {
				return { ...state, chartContainer: chartElement };
			});
		},
		setChartData: (newData) => {
			update((state) => {
				return { ...state, data: newData };
			});
		}
	};

	return [subscribe, chartStateDispatch];
};
