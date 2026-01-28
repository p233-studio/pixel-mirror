<script lang="ts">
  // Svelte
  import { onDestroy, onMount } from "svelte";

  // Stores
  import { dockStore } from "~/stores/dockStore.svelte";
  import { keyboardStore } from "~/stores/keyboardStore.svelte";
  import { mockupOverlayStore } from "~/stores/mockupOverlayStore.svelte";

  // Debounce timer for resize events
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    mockupOverlayStore.init();
    keyboardStore.init();
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    keyboardStore.cleanup();
    mockupOverlayStore.cleanup();
  });

  function handleResize() {
    if (!mockupOverlayStore.isAligned) return;

    // Debounce resize events to avoid excessive updates
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      mockupOverlayStore.updateAlignedPosition();
    }, 100);
  }

  /**
   * Check if mouse events should be handled on the overlay
   * Only active when dock is in toolbar mode
   */
  let isInteractive = $derived(dockStore.mode === "toolbar");

  // Cursor mapping for different overlay modes
  const CURSOR_MAP: Record<string, string> = {
    dragging: "grabbing",
    solid: "zoom-in",
    zoomed: "zoom-out",
    visible: "grab"
  };

  // Derived interaction styles based on state machine
  let interactionStyles = $derived.by(() => {
    if (!isInteractive || mockupOverlayStore.isLocked) {
      return { cursor: "default", pointerEvents: "none" };
    }

    return {
      cursor: CURSOR_MAP[mockupOverlayStore.mode] || "grab",
      pointerEvents: "auto"
    };
  });

  let transform = $derived(
    `translate3d(${mockupOverlayStore.position.x}px, ${mockupOverlayStore.position.y}px, 0) scale(${mockupOverlayStore.scale})`
  );

  // Disable transition during dragging and zoom panning for immediate response
  let transition = $derived(
    mockupOverlayStore.isDragging || mockupOverlayStore.isZoomPanning ? "none" : "transform 0.2s ease-out"
  );

  /**
   * Mouse event handler - only processes events when dock is in toolbar mode
   * State machine handles the mode transitions
   */
  function handleMouseDown(e: MouseEvent) {
    // Don't handle events if dock is not in toolbar mode
    if (!isInteractive) return;

    const { mode } = mockupOverlayStore;

    switch (mode) {
      case "visible":
        mockupOverlayStore.startDrag(e);
        break;
      case "solid":
        mockupOverlayStore.enterZoomMode(e);
        break;
      case "zoomed":
        mockupOverlayStore.exitZoomMode();
        break;
    }
  }
</script>

{#if !mockupOverlayStore.isHidden && mockupOverlayStore.activeMockupUrl}
  <div class="mockup-container">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <img
      draggable="false"
      class="mockup-overlay"
      src={mockupOverlayStore.activeMockupUrl}
      alt="Mockup Overlay"
      style:transform
      style:transition
      style:cursor={interactionStyles.cursor}
      style:pointer-events={interactionStyles.pointerEvents}
      style:opacity={mockupOverlayStore.effectiveOpacity}
      onmousedown={handleMouseDown}
    />
  </div>
{/if}

<style lang="scss">
  .mockup-container {
    position: absolute;
    inset: 0;
    z-index: $max-z-index - 3;
    overflow: hidden;
    pointer-events: none;
  }

  .mockup-overlay {
    position: absolute;
    top: 0;
    left: 0;
    max-width: none;
    user-select: none;
    transform-origin: top left;
    backface-visibility: hidden;
    will-change: transform;
  }
</style>
