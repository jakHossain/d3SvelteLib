<script>
	import { onMount } from 'svelte';

	export let chartContainerRef;
	export let svgRef;

	onMount(() => {
		console.log('DAWD', svgRef);
	});
</script>

<div bind:this={chartContainerRef} class="chart-container">
	<h4 class="chart-title">
		<slot name="chartTitle"></slot>
	</h4>
	<h5 class="chart-deck">
		<slot name="chartDeck"></slot>
	</h5>
	<svg bind:this={svgRef} class="svgBody">
		<slot name="chartBody"></slot>
		<g>
			<slot name="x-axis"></slot>
		</g>
		<g>
			<slot name="y-axis"></slot>
		</g>
	</svg>
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.chart-title {
		font-weight: 700;
		font-size: 20px;
		margin: 0;
	}

	.chart-deck {
		font-weight: normal;
		font-size: 16px;
		margin: 10px 0;
	}

	.svgBody {
		flex-grow: 1;
		width: 100%;
	}
</style>
