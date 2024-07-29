<script>
	import LineChart from '../lib/components/charts/LineChart.svelte';
	import Scatter from '../lib/components/charts/Scatter.svelte';

	let data = [
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
</script>

<main>
	<Scatter margin={50} {data} />
	<LineChart margin={50} {data} />
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
