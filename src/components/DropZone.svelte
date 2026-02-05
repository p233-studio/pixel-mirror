<script lang="ts">
  import IconUpload from "~/assets/image-upload-stroke-rounded.svg?component";

  interface Props {
    visible: boolean;
  }

  let { visible }: Props = $props();
</script>

{#if visible}
  <div class="drop-zone" role="region" aria-label="Drop zone for mockup upload">
    <div class="drop-zone__card">
      <div class="drop-zone__icon">
        <IconUpload />
      </div>
      <p class="drop-zone__text">Drop image to set as mockup</p>
    </div>
  </div>
{/if}

<style lang="scss">
  .drop-zone {
    position: fixed;
    inset: 0;
    z-index: $max-z-index;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    animation: fade-in $transition-fast $timing-function;

    &__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: rhythm(4) rhythm(6);
      background: color-mix(in srgb, var(--dock-bg) 75%, transparent);
      border: 2px dashed var(--dock-border);
      border-radius: rhythm(2);
      animation: scale-in $transition-fast $timing-function;
    }

    &__icon {
      margin-bottom: rhythm(1.5);
      color: var(--text-primary);

      :global(svg) {
        width: rhythm(6);
        height: rhythm(6);
      }
    }

    &__text {
      margin: 0;
      font-family: "Arial", sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.92);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
