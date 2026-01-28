<svelte:options customElement="pixel-mirror" />

<script lang="ts">
  import Dock from "~/components/Dock.svelte";
  import GridOverlay from "~/components/GridOverlay.svelte";
  import MockupOverlay from "~/components/MockupOverlay.svelte";
  import Toast from "~/components/Toast.svelte";
  import { dockStore } from "~/stores/dockStore.svelte";
</script>

<div class="theme-root" class:dark={dockStore.theme === "dark"}>
  <GridOverlay />
  <MockupOverlay />
  <Dock />
  <Toast />
</div>

<style lang="scss">
  .theme-root {
    // Dock
    --dock-bg: #fff;
    --dock-fg: #000;
    --dock-border: #000;
    --dock-outline: rgba(255, 255, 255, 0.5);

    // Text
    --text-primary: #000;
    --text-secondary: #333;

    // Border
    --border-light: #eee;
    --border-medium: #d4d4d4;

    // Input
    --input-bg: #fff;
    --input-text: #000;
    --input-placeholder: #999;
    --input-border: #d4d4d4;

    // Button
    --btn-bg: #000;
    --btn-fg: #fff;
    --btn-hover-bg: #333;

    // Focus
    --focus-ring: #d9daff;
    --focus-bg: rgba(217, 218, 255, 0.2);

    // Status
    --color-success: #10b981;
    --color-success-bg: #ecfdf5;
    --color-danger: #fe0200;

    // Mockup
    --mockup-border: #d9daff;
    --mockup-border-hover: #000;

    // Alignment
    --align-x-bg: rgba(0, 0, 255, 0.05);
    --align-x-hover: rgba(0, 0, 255, 0.1);
    --align-x-active: rgba(0, 0, 255, 0.2);
    --align-y-bg: rgba(255, 0, 0, 0.05);
    --align-y-hover: rgba(255, 0, 0, 0.1);
    --align-y-active: rgba(255, 0, 0, 0.2);

    // Dark mode
    &.dark {
      --dock-bg: #1a1a1a;
      --dock-fg: #e8e8e8;
      --dock-border: #1a1a1a;
      --dock-outline: rgba(255, 255, 255, 0.2);

      --text-primary: #e8e8e8;
      --text-secondary: #999;

      --border-light: #3a3a3a;
      --border-medium: #4a4a4a;

      --input-bg: #2a2a2a;
      --input-text: #e8e8e8;
      --input-placeholder: #666;
      --input-border: #4a4a4a;

      --btn-bg: #4a4a4a;
      --btn-fg: #e8e8e8;
      --btn-hover-bg: #5a5a5a;

      --focus-ring: #7a7cb8;
      --focus-bg: rgba(122, 124, 184, 0.2);

      --color-success-bg: rgba(16, 185, 129, 0.15);

      --mockup-border: #4a4a4a;
      --mockup-border-hover: #e8e8e8;

      --align-x-bg: rgba(120, 170, 240, 0.2);
      --align-x-hover: rgba(120, 170, 240, 0.3);
      --align-x-active: rgba(120, 170, 240, 0.4);
      --align-y-bg: rgba(240, 130, 150, 0.2);
      --align-y-hover: rgba(240, 130, 150, 0.3);
      --align-y-active: rgba(240, 130, 150, 0.4);
    }
  }

  :global {
    * {
      box-sizing: border-box;
    }

    button {
      padding: 0;
      margin: 0;
      font: inherit;
      color: inherit;
      cursor: pointer;
      outline: none;
      background: none;
      border: none;
      -webkit-tap-highlight-color: transparent;

      &:disabled {
        cursor: default;
      }

      &:not(:disabled):active {
        transform: scale(0.95);
      }
    }

    svg {
      display: block;
      color: currentColor;
      fill: none;
    }
  }
</style>
