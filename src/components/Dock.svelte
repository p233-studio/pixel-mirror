<script lang="ts">
  // Svelte
  import { onMount } from "svelte";

  // Icons
  import IconAlignBottom from "~/assets/align-bottom-stroke-rounded.svg?component";
  import IconAlignCenterX from "~/assets/align-horizontal-center-stroke-rounded.svg?component";
  import IconAlignLeft from "~/assets/align-left-stroke-rounded.svg?component";
  import IconAlignRight from "~/assets/align-right-stroke-rounded.svg?component";
  import IconAlignTop from "~/assets/align-top-stroke-rounded.svg?component";
  import IconScale from "~/assets/border-all-02-stroke-rounded.svg?component";
  import IconAlignment from "~/assets/coordinate-01-stroke-rounded.svg?component";
  import IconSide from "~/assets/flip-top-stroke-rounded.svg?component";
  import IconGridManager from "~/assets/grid-table-stroke-rounded.svg?component";
  import IconOpacity from "~/assets/idea-01-stroke-rounded.svg?component";
  import IconShow from "~/assets/image-02-stroke-rounded.svg?component";
  import IconHide from "~/assets/image-not-found-01-stroke-rounded.svg?component";
  import IconMockupManager from "~/assets/image-upload-stroke-rounded.svg?component";
  import IconMoon from "~/assets/moon-02-stroke-rounded.svg?component";
  import IconLock from "~/assets/square-lock-02-stroke-rounded.svg?component";
  import IconUnlock from "~/assets/square-unlock-02-stroke-rounded.svg?component";
  import IconSun from "~/assets/sun-03-stroke-rounded.svg?component";
  // Stores
  import { DOCK_TRANSITION_DURATION, dockStore } from "~/stores/dockStore.svelte";
  import { mockupOverlayStore } from "~/stores/mockupOverlayStore.svelte";
  // Components
  import GridManager from "./GridManager.svelte";
  import MockupManager from "./MockupManager.svelte";

  let showAlignmentOptions = $state(false);
  let dockElement: HTMLDivElement;

  // Derived values from mockupOverlayStore
  let opacityDisplay = $derived(Math.round(mockupOverlayStore.opacity * 100));
  let scaleDisplay = $derived(mockupOverlayStore.scale === 0.5 ? ".5x" : `${mockupOverlayStore.scale}x`);

  // Mockup disabled states
  let isMockupDisabled = $derived(!mockupOverlayStore.activeMockupId);
  let isHidden = $derived(mockupOverlayStore.isHidden);
  let isLocked = $derived(mockupOverlayStore.isLocked);
  let isDragging = $derived(mockupOverlayStore.isDragging);

  /**
   * Controls are disabled when:
   * - No active mockup
   * - Mockup is hidden
   */
  let isControlsDisabled = $derived(isMockupDisabled || isHidden);

  let showPositionDisplay = $derived(dockStore.mode === "toolbar" && !showAlignmentOptions && !isControlsDisabled);

  function handleAlignmentMouseEnter() {
    if (isDragging) return;
    showAlignmentOptions = true;
  }

  function handleAlignmentMouseLeave(e: MouseEvent) {
    const target = e.relatedTarget as Element | null;
    const isRelatedToAlignment = target?.closest(".dock__popover") || target?.closest(".alignment-trigger-btn");

    if (!isRelatedToAlignment) {
      showAlignmentOptions = false;
    }
  }

  $effect(() => {
    if (!dockStore.isManagerMode) return;

    const showTimer = setTimeout(() => {
      dockStore.managerVisible = true;
    }, DOCK_TRANSITION_DURATION);

    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      if (!path.includes(dockElement)) {
        dockStore.enterToolbar();
      }
    };

    const listenerTimer = setTimeout(() => {
      window.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(listenerTimer);
      window.removeEventListener("click", handleClickOutside);
    };
  });

  onMount(() => {
    dockStore.init();
  });
</script>

<div
  bind:this={dockElement}
  class="dock"
  class:at-top={dockStore.position === "top"}
  class:is-dragging={isDragging}
  style:--transition-duration="{DOCK_TRANSITION_DURATION}ms"
  style:width="{dockStore.size.width}px"
  style:height="{dockStore.size.height}px"
  hidden={!dockStore.initialized || mockupOverlayStore.isSolidOrZoomed}
>
  {#if dockStore.mode === "toolbar" && dockStore.toolbarVisible}
    <div class="toolbar">
      <button
        class="icon-button"
        data-testid="btn-visibility"
        disabled={isMockupDisabled}
        onclick={mockupOverlayStore.toggleVisibility}
        title={isHidden ? "Show mockup" : "Hide mockup"}
      >
        {#if isHidden}
          <IconHide />
        {:else}
          <IconShow />
        {/if}
      </button>
      <button
        class="icon-button"
        data-testid="btn-lock"
        disabled={isControlsDisabled}
        onclick={() => mockupOverlayStore.toggleLock()}
        title={isLocked ? "Unlock mockup position" : "Lock mockup position"}
      >
        {#if isLocked}
          <IconLock />
        {:else}
          <IconUnlock />
        {/if}
      </button>
      <button
        class="icon-button opacity-button"
        data-testid="btn-opacity"
        disabled={isControlsDisabled}
        onclick={mockupOverlayStore.resetOpacity}
        title="Opacity (Click to reset, Ctrl+Scroll to adjust)"
      >
        <IconOpacity />
        <span class="opacity-button__value">{opacityDisplay}</span>
      </button>
      <button
        class="icon-button alignment-trigger-btn"
        data-testid="btn-alignment"
        disabled={isControlsDisabled || isLocked}
        onmouseenter={handleAlignmentMouseEnter}
        onmouseleave={handleAlignmentMouseLeave}
        onclick={() => mockupOverlayStore.setAlignment("top", "center")}
        title="Alignment (Click for top-center)"
      >
        <IconAlignment />
      </button>
      <button
        class="icon-button scale-button"
        data-testid="btn-scale"
        disabled={isControlsDisabled || isLocked}
        onclick={mockupOverlayStore.cycleScale}
        title="Scale (1x ↔ 0.5x)"
      >
        <IconScale />
        <span class="scale-button__value">{scaleDisplay}</span>
      </button>
      <button
        class="icon-button"
        data-testid="btn-mockup-manager"
        onclick={dockStore.enterMockups}
        title="Mockup Manager"
      >
        <IconMockupManager />
      </button>
      <button class="icon-button" data-testid="btn-grid-manager" onclick={dockStore.enterGrids} title="Grid Manager">
        <IconGridManager />
      </button>
      <button class="icon-button" data-testid="btn-theme" onclick={dockStore.toggleTheme} title="Toggle theme">
        {#if dockStore.theme === "dark"}
          <IconSun />
        {:else}
          <IconMoon />
        {/if}
      </button>
      <button
        class="icon-button"
        class:flip={dockStore.position === "top"}
        data-testid="btn-position"
        onclick={dockStore.togglePosition}
        title="Toggle dock position"
      >
        <IconSide />
      </button>
    </div>

    {#if showAlignmentOptions && !isControlsDisabled && !isLocked}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="dock__popover" onmouseleave={handleAlignmentMouseLeave}>
        <div class="alignment-group alignment-group--vertical">
          <button
            class="alignment-button"
            class:active={mockupOverlayStore.alignmentY === "top"}
            onclick={() => mockupOverlayStore.setAlignmentY("top")}
            title="Align top"
          >
            <IconAlignTop />
          </button>
          <button
            class="alignment-button"
            class:active={mockupOverlayStore.alignmentY === "bottom"}
            onclick={() => mockupOverlayStore.setAlignmentY("bottom")}
            title="Align bottom"
          >
            <IconAlignBottom />
          </button>
        </div>
        <div class="alignment-group alignment-group--horizontal">
          <button
            class="alignment-button"
            class:active={mockupOverlayStore.alignmentX === "left"}
            onclick={() => mockupOverlayStore.setAlignmentX("left")}
            title="Align left"
          >
            <IconAlignLeft />
          </button>
          <button
            class="alignment-button"
            class:active={mockupOverlayStore.alignmentX === "center"}
            onclick={() => mockupOverlayStore.setAlignmentX("center")}
            title="Align center horizontally"
          >
            <IconAlignCenterX />
          </button>
          <button
            class="alignment-button"
            class:active={mockupOverlayStore.alignmentX === "right"}
            onclick={() => mockupOverlayStore.setAlignmentX("right")}
            title="Align right"
          >
            <IconAlignRight />
          </button>
        </div>
      </div>
    {/if}
  {:else if dockStore.mode === "mockups" && dockStore.managerVisible}
    <div class="manager-wrapper">
      <MockupManager />
    </div>
  {:else if dockStore.mode === "grids" && dockStore.managerVisible}
    <div class="manager-wrapper">
      <GridManager />
    </div>
  {/if}

  {#if showPositionDisplay}
    <div class="dock__coordinates">{mockupOverlayStore.positionDisplay}</div>
  {/if}
</div>

<style lang="scss">
  .dock {
    position: fixed;
    right: rhythm(2);
    bottom: rhythm(4);
    left: rhythm(2);
    z-index: $max-z-index;
    max-width: calc(100vw - #{rhythm(4)});
    max-height: 80vh;
    margin-right: auto;
    margin-left: auto;
    font-family: "Arial", sans-serif;
    color: var(--dock-fg);
    user-select: none;
    outline: $outline-width solid var(--dock-outline);
    background: var(--dock-bg);
    border: $border-width-md solid var(--dock-border);
    border-radius: rhythm(4);
    transform: translateZ(0);
    transition:
      width var(--transition-duration) $timing-function,
      height var(--transition-duration) $timing-function;
    will-change: width, height;

    &.at-top {
      top: rhythm(5);
      bottom: auto;
    }

    &.is-dragging {
      pointer-events: none;
    }

    &__coordinates {
      position: absolute;
      right: 0;
      bottom: calc(100% + 8px);
      left: 0;
      z-index: 1;
      width: max-content;
      padding: 0 rhythm(1);
      margin: auto;
      font-family: monospace;
      font-size: 12px;
      line-height: 20px;
      color: var(--btn-fg);
      white-space: nowrap;
      background: var(--btn-bg);
      border-radius: rhythm(2);
    }

    &__popover {
      position: absolute;
      bottom: 100%;
      left: 92px;
      z-index: 2;
      display: flex;
      align-items: center;
      padding: rhythm(0.5) rhythm(0.5) 0;
      overflow: hidden;
      background: var(--dock-bg);
      border: $border-width-md solid var(--dock-border);
      border-bottom: none;
      border-radius: rhythm(1.5) rhythm(1.5) 0 0;
    }
  }

  .toolbar,
  .dock__popover {
    :global(button:focus) {
      outline: none;
    }
  }

  .toolbar {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    padding: 0 rhythm(1.5);
    overflow-x: auto;
    transform: translate(-50%, -50%);
  }

  .icon-button {
    padding: rhythm(1) rhythm(0.75);
    opacity: 0.75;

    &:not(:disabled):hover {
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.25;
    }

    &.flip {
      transform: rotate(180deg);

      &:active {
        transform: scale(0.95) rotate(180deg);
      }
    }
  }

  .opacity-button {
    position: relative;

    &__value {
      position: absolute;
      top: 18px;
      right: 0;
      left: 0;
      z-index: 1;
      font-size: 8px;
      font-weight: 700;
      line-height: 1;
      text-align: center;
    }
  }

  .scale-button {
    position: relative;

    &__value {
      position: absolute;
      inset: 0;
      z-index: 1;
      height: 16px;
      margin: auto;
      font-size: 11.5px;
      font-weight: 700;
      line-height: 16px;
      text-align: center;
    }
  }

  .alignment-group {
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: rhythm(0.75);

    + .alignment-group {
      margin-left: rhythm(0.5);
    }

    &--vertical {
      background: var(--align-y-bg);

      .alignment-button {
        &:hover {
          background: var(--align-y-hover);
        }

        &:active,
        &.active {
          background: var(--align-y-active);
        }
      }
    }

    &--horizontal {
      background: var(--align-x-bg);

      .alignment-button {
        &:hover {
          background: var(--align-x-hover);
        }

        &:active,
        &.active {
          background: var(--align-x-active);
        }
      }
    }
  }

  .alignment-button {
    padding: 2px;
    border-radius: rhythm(0.75);

    :global(> svg) {
      width: 24px;
      height: 24px;
    }
  }

  .manager-wrapper {
    width: 100%;
    height: 100%;

    :global(.inner) {
      animation: fadeIn $transition-fast $timing-function;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
</style>
