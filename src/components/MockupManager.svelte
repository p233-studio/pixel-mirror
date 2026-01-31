<script lang="ts">
  // Svelte
  import { onMount } from "svelte";

  // Constants
  import { ALLOWED_MIME_TYPES } from "~/constants";
  // Icons
  import IconDelete from "~/assets/delete-02-stroke-rounded.svg?component";
  import IconUpload from "~/assets/image-upload-stroke-rounded.svg?component";
  // Stores
  import { DOCK_TRANSITION_DURATION, dockStore } from "~/stores/dockStore.svelte";
  import { mockupManagerStore } from "~/stores/mockupManagerStore.svelte";

  onMount(() => {
    mockupManagerStore.init();
  });

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      mockupManagerStore.upload(Array.from(target.files));
    }
    target.value = "";
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []).filter((file) =>
      ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])
    );
    mockupManagerStore.upload(files);
  }

  function handleDelete(e: Event, id: string) {
    e.stopPropagation();
    mockupManagerStore.delete(id);
  }

  function handleSelect(id: string) {
    dockStore.enterToolbar();
    setTimeout(() => mockupManagerStore.select(id), DOCK_TRANSITION_DURATION);
  }

  function blobSrc(node: HTMLImageElement, { buffer, mimeType }: { buffer: ArrayBuffer; mimeType: string }) {
    let url: string | undefined;

    function update(b: ArrayBuffer, t: string) {
      if (url) URL.revokeObjectURL(url);
      const blob = new Blob([b], { type: t });
      url = URL.createObjectURL(blob);
      node.src = url;
    }

    update(buffer, mimeType);

    return {
      update({ buffer: newBuffer, mimeType: newType }: { buffer: ArrayBuffer; mimeType: string }) {
        update(newBuffer, newType);
      },
      destroy() {
        if (url) URL.revokeObjectURL(url);
      }
    };
  }
</script>

{#if mockupManagerStore.initialized}
  <div class="container" role="region" aria-label="Mockup Manager" ondrop={handleDrop} ondragover={handleDragOver}>
    <div class="inner">
      <section class="section">
        <div class="grid">
          <label class="upload-button">
            <span class="upload-button__icon">
              <IconUpload />
            </span>
            <span class="upload-button__text">Upload Mockup</span>
            <input type="file" accept={ALLOWED_MIME_TYPES.join(",")} multiple onchange={handleInputChange} />
          </label>

          {#each mockupManagerStore.mockups as mockup (mockup.id)}
            {@const isActive = mockupManagerStore.activeMockupId === mockup.id}
            <div class="mockup" class:active={isActive}>
              <button class="mockup__preview" type="button" disabled={isActive} onclick={() => handleSelect(mockup.id)}>
                <img
                  class="mockup__image"
                  use:blobSrc={{ buffer: mockup.thumbnailBuffer, mimeType: mockup.mimeType }}
                  alt={mockup.filename}
                  draggable="false"
                />
              </button>
              {#if isActive}
                <div class="mockup__indicator"></div>
              {/if}
              <button class="mockup__delete" onclick={(e) => handleDelete(e, mockup.id)} title="Delete mockup">
                <IconDelete />
              </button>
            </div>
          {/each}
        </div>
      </section>
    </div>
    <footer class="footer">
      <button
        class="footer__button"
        data-testid="btn-clear"
        onclick={mockupManagerStore.clear}
        disabled={mockupManagerStore.mockups.length === 0}
      >
        Clear Mockups
      </button>
      <button class="footer__button" data-testid="btn-close" onclick={dockStore.enterToolbar}>Close</button>
    </footer>
  </div>
{/if}

<style lang="scss">
  .container {
    @include manager-container;
  }

  .inner {
    @include manager-inner;
  }

  .footer {
    @include manager-footer;

    &__button {
      @include manager-footer-button;
    }
  }

  .section {
    padding: rhythm(1) 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 180px);
    gap: rhythm(2);
  }

  .upload-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    cursor: pointer;
    outline: none;
    background: transparent;
    border: $border-width-md dashed var(--text-secondary);
    border-radius: rhythm(1.5);
    transition: background $transition-fast ease;

    &:hover,
    &:focus-visible,
    &:has(:focus-visible) {
      @include focus-ring;
      background: var(--focus-bg);
      border-color: var(--mockup-border-hover);
    }

    &__icon {
      width: rhythm(4);
      height: rhythm(4);
      margin-bottom: rhythm(1.5);

      :global(> svg) {
        width: 100%;
        height: 100%;
      }
    }

    &__text {
      font-size: 15px;
      font-weight: 500;
    }
  }

  input[type="file"] {
    @include visually-hidden;
  }

  .mockup {
    position: relative;
    width: 180px;
    height: 180px;

    &:hover .mockup__delete {
      opacity: 1;
    }

    &.active .mockup__preview {
      border-color: var(--mockup-border-hover);
    }

    &__preview {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: $border-width-md solid var(--mockup-border);
      border-radius: rhythm(2);

      &:hover,
      &:focus {
        border-color: var(--mockup-border-hover);
        @include focus-ring;
      }
    }

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__indicator {
      position: absolute;
      top: rhythm(1.5);
      left: rhythm(1.5);
      width: rhythm(1.5);
      height: rhythm(1.5);
      pointer-events: none;
      background: var(--color-success);
      border-radius: 50%;
      box-shadow: 0 0 0 $border-width-md var(--dock-bg);
    }

    &__delete {
      position: absolute;
      right: rhythm(1.5);
      bottom: rhythm(1.5);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: rhythm(4);
      height: rhythm(4);
      padding: rhythm(0.5);
      color: var(--btn-fg);
      background: var(--btn-bg);
      border-radius: rhythm(2);
      opacity: 0;
      transition:
        background $transition-fast ease,
        opacity $transition-fast ease;

      :global(> svg) {
        width: rhythm(2.5);
        height: rhythm(2.5);
      }

      &:hover,
      &:focus-visible {
        background: var(--btn-hover-bg);
        opacity: 1;
        @include focus-ring;
      }

      &:active {
        transform: none;
      }
    }
  }
</style>
