<script lang="ts">
  import { onDestroy } from "svelte";
  import IconWarning from "~/assets/alert-02-stroke-rounded.svg?component";
  import { toastStore } from "~/stores/toastStore.svelte";

  let listenerAttached = false;

  $effect(() => {
    if (!toastStore.errorMessage) return;

    window.addEventListener("mousedown", toastStore.clear);
    listenerAttached = true;
    return () => {
      window.removeEventListener("mousedown", toastStore.clear);
      listenerAttached = false;
    };
  });

  onDestroy(() => {
    if (listenerAttached) {
      window.removeEventListener("mousedown", toastStore.clear);
    }
  });
</script>

{#if toastStore.errorMessage}
  <div class="toast">
    <IconWarning />
    <span class="toast__message">{toastStore.errorMessage}</span>
  </div>
{/if}

<style lang="scss">
  .toast {
    position: fixed;
    top: rhythm(2);
    left: 50%;
    z-index: $max-z-index;
    display: flex;
    gap: rhythm(1);
    max-width: min(90vw, 400px);
    padding: rhythm(1) rhythm(2);
    font-family: "Arial", sans-serif;
    color: #fff;
    outline: $outline-width solid rgba(255, 255, 255, 0.5);
    background: var(--color-danger);
    border-radius: rhythm(2);
    transform: translateX(-50%);
    animation: toast-in 0.25s $timing-function;

    :global(> svg) {
      flex-shrink: 0;
      width: rhythm(2.5);
      height: rhythm(2.5);
    }

    &__message {
      padding: rhythm(0.125) 0;
      font-size: 15px;
      font-weight: 500;
      line-height: rhythm(2.25);
    }
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
