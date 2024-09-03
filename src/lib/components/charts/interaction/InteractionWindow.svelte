<script>
	export let svgDivContainer;
	export let margin;
	export let vTooltip = true;
	export let onIWHover;
	export let onIWExit;

	let interactionWindowRef;
	let vTooltipRef;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={interactionWindowRef}
	class="interaction-window"
	style={`width: calc(100% - ${margin * 2}px); height: calc(100% - ${margin * 2}px); transform: translate(${margin}px, ${margin}px)`}
	on:mousemove={(event) => {
		if (event.target == interactionWindowRef) {
			vTooltipRef.style.display = 'inline-block';
			vTooltipRef.style.left = event.offsetX + 'px';
			onIWHover(event);
		}
	}}
	on:mouseleave={() => {
		vTooltipRef.style.display = 'none';
		onIWExit();
	}}
>
	{#if vTooltip}
		<span class="vertical-tooltip" bind:this={vTooltipRef}></span>
	{/if}
</div>

<style>
	.interaction-window {
		position: absolute;
		left: 0;
		top: 0;
	}
	.vertical-tooltip {
		display: none;
		box-sizing: border-box;
		height: 100%;
		width: 1px;
		position: absolute;
		left: 200px;
		border-right: solid 1px black;
		z-index: -1;
	}
</style>
