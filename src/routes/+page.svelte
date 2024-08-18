<script>
	import LineChart from '../lib/components/charts/LineChart.svelte';
	import Scatter from '../lib/components/charts/Scatter.svelte';
	import { onMount } from 'svelte';
	import { readCsv } from '../lib/utilities/CSVParsingUtil';
	import PollChart from '../lib/components/charts/PollChart.svelte';
	import { getMaxFromArray, getMinFromArray } from '../lib/utilities/ChartUtil';
	import LineChartv2 from '../lib/components/charts/LineChartv2.svelte';

	let data = [
		{ x: 0, y: 4, label: 'A' },
		{ x: 10, y: 15, label: 'A' },
		{ x: 20, y: 25, label: 'B' },
		{ x: 30, y: 10, label: 'C' },
		{ x: 40, y: 30, label: 'D' },
		{ x: 50, y: 20, label: 'E' },
		{ x: 60, y: 40, label: 'F' },
		{ x: 70, y: 35, label: 'G' },
		{ x: 80, y: 45, label: 'H' },
		{ x: 90, y: 55, label: 'I' },
		{ x: 100, y: 50, label: 'J' }
	];

	let predictionLineData;

	const csvUrl = '../src/assets/poll_data.csv';
	onMount(async () => {
		const csvData = await (await fetch(csvUrl)).text();
		predictionLineData = await readCsv(csvData);
		console.log(predictionLineData);
	});
</script>

<main>
	<!-- <LineChart margin={50} {data} /> -->
	<!-- {#if predictionLineData}
		<PollChart data={predictionLineData.data} margin={50} />
	{/if} -->
	<LineChartv2 chartData={data}></LineChartv2>
</main>

<style>
	main {
		width: 50vw;
		height: 60vh;
		margin: auto;
		min-width: 500px;
		min-height: 250px;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 2rem;
	}
</style>
