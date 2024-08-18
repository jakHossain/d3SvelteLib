<script>
	import { onMount, onDestroy } from 'svelte';
	import { initChartData } from '../../stores/ChartStore';
	import SvgContainer from '../chartElements/SvgContainer.svelte';

	const [subscribeChartState, chartStateDispatch] = initChartData();

	let chartState;

	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});
</script>

<SvgContainer {chartStateDispatch}>
	<span slot="chartTitle"
		>Chart title: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
</SvgContainer>

<button
	on:click={() => {
		console.log(chartState);
	}}
	>asdsad
</button>
