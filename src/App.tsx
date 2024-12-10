import clsx from "clsx";
import { onMount, createSignal, createEffect, createMemo, onCleanup, Show, For } from "solid-js";
import DesignDB from "./stores/designDB";
import { persistState, updatePersistState } from "./stores/persistState";
import { memoryState, setMemoryState } from "./stores/memoryState";
import css from "./App.module.scss";

import IconDesignShow from "~/assets/image-02-stroke-rounded.svg";
// import IconDesignHide from "~/assets/image-not-found-01-stroke-rounded.svg";
import IconDesignFolder from "~/assets/folder-upload-stroke-rounded.svg";

import IconAlignment from "~/assets/keyframe-align-center-stroke-rounded.svg";
import IconAlignmentTop from "~/assets/align-top-stroke-rounded.svg";
import IconAlignmentBottom from "~/assets/align-bottom-stroke-rounded.svg";
import IconAlignmentLeft from "~/assets/align-left-stroke-rounded.svg";
import IconAlignmentRight from "~/assets/align-right-stroke-rounded.svg";
import IconAlignmentCenter from "~/assets/align-horizontal-center-stroke-rounded.svg";

import IconGridShow from "~/assets/grid-stroke-rounded.svg";
// import IconGridHide from "~/assets/grid-off-stroke-rounded.svg";

import IconZoomIn from "~/assets/square-arrow-expand-01-stroke-rounded.svg";
// import IconZoomOut from "~/assets/square-arrow-shrink-01-stroke-rounded.svg";

// import IconLock from "~/assets/square-lock-02-stroke-rounded.svg";
import IconUnlock from "~/assets/square-unlock-02-stroke-rounded.svg";

import IconOpacity from "~/assets/idea-01-stroke-rounded.svg";
import IconSettings from "~/assets/settings-02-stroke-rounded.svg";
import IconDrag from "~/assets/drag-drop-vertical-stroke-rounded.svg";

export default function App() {
  const dimensions = createMemo(() => {
    if (memoryState.showDesignsPanel) {
      return { width: "760px", height: "240px" };
    }
    if (memoryState.showSettingsPanel) {
      return { width: "640px", height: "360px" };
    }
    return { width: "408px", height: "48px" };
  });

  const showAlignmentPopover = () => {
    setMemoryState("showAlignmentPopover", true);
  };

  const hideAlignmentPopover = (e: MouseEvent) => {
    const target = e.relatedTarget as Element | null;
    if (!target?.closest("#alignment-popover")) {
      setMemoryState("showAlignmentPopover", false);
    }
  };

  const toggleDesignsPanel = () => {
    setMemoryState("showDesignsPanel", !memoryState.showDesignsPanel);
  };

  const toggleSettingsPanel = () => {
    setMemoryState("showSettingsPanel", !memoryState.showSettingsPanel);
  };

  return (
    <>
      <DesignOverlay />

      <div class={css.app} style={dimensions()}>
        <Show when={!memoryState.showDesignsPanel && !memoryState.showSettingsPanel}>
          <div class={css.menuBar}>
            <button class={clsx(css.menuButton, css.actionButton)}>
              <IconDesignShow />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)}>
              <IconUnlock />
            </button>
            <button class={clsx(css.menuButton, css.actionButton, css.opacityButton)}>
              <span class={css.opacityButton__value}>50</span>
              <IconOpacity />
            </button>
            <button
              class={clsx(css.menuButton, css.alignmentTrigger)}
              onMouseEnter={showAlignmentPopover}
              onMouseLeave={hideAlignmentPopover}
            >
              <IconAlignment />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)}>
              <IconZoomIn />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)}>
              <IconGridShow />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleDesignsPanel}>
              <IconDesignFolder />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleSettingsPanel}>
              <IconSettings />
            </button>
            <button class={clsx(css.menuButton, css.grabButton)}>
              <IconDrag />
            </button>
          </div>
        </Show>

        <Show when={memoryState.showAlignmentPopover}>
          <div
            id="alignment-popover"
            class={css.alignmentPopover}
            onMouseLeave={hideAlignmentPopover}
          >
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentLeft />
            </button>
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentTop />
            </button>
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentCenter />
            </button>
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentBottom />
            </button>
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentRight />
            </button>
          </div>
        </Show>

        <Show when={memoryState.showDesignsPanel}>
          <div class={css.panel}>
            <div class={css.panel__contentWrapper}>
              <div class={css.panel__content}>
                <DesignGrid />
              </div>
            </div>
            <button class={css.panel__closeButton} onClick={toggleDesignsPanel}>
              Close
            </button>
          </div>
        </Show>

        <Show when={memoryState.showSettingsPanel}>
          <div class={css.panel}>
            <div class={css.panel__contentWrapper}>
              <div class={css.panel__content} />
            </div>
            <button class={css.panel__closeButton} onClick={toggleSettingsPanel}>
              Close
            </button>
          </div>
        </Show>
      </div>
    </>
  );
}

function Design(props: Design) {
  const [imgUrl, setImgUrl] = createSignal("");

  onMount(() => {
    const blob = new Blob([props.buffer], { type: props.mimeType });
    const url = URL.createObjectURL(blob);
    setImgUrl(url);
  });

  onCleanup(() => {
    URL.revokeObjectURL(imgUrl());
  });

  const handleDesignSelect = () => {
    updatePersistState({ designId: props.id });
    setMemoryState("showDesignsPanel", false);
  };

  return <img src={imgUrl()} draggable={false} onClick={handleDesignSelect} alt="" />;
}

function DesignGrid() {
  const [designArray, setDesignArray] = createSignal<Design[]>([]);

  onMount(() => {
    DesignDB.getAllDesigns()
      .then((designs) => setDesignArray(designs))
      .catch((error) => console.error(error));
  });

  const handleDesignUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    try {
      const newAddedDesigns = await DesignDB.upload(files);
      setDesignArray([...newAddedDesigns, ...designArray()]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div class={css.designGrid}>
      {<For each={designArray()}>{(design) => <Design {...design} />}</For>}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => void handleDesignUpload(e)}
      />
    </div>
  );
}

function DesignOverlay() {
  const [imgUrl, setImgUrl] = createSignal("");
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 });

  createEffect(() => {
    if (!persistState.designId) return;
    DesignDB.getDesign(persistState.designId)
      .then((design) => {
        if (!design) {
          throw new Error("Failed to load design image.");
        }
        const blob = new Blob([design.buffer], { type: design.mimeType });
        const url = URL.createObjectURL(blob);
        setImgUrl(url);
      })
      .catch((error) => {
        console.error(error);
        updatePersistState({ designId: null });
      });
  });

  onCleanup(() => {
    URL.revokeObjectURL(imgUrl());
  });

  const handleDesignLoad = (event: Event) => {
    const img = event.target as HTMLImageElement;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  return (
    <Show when={!!imgUrl}>
      <img
        alt=""
        src={imgUrl()}
        width={dimensions().width}
        height={dimensions().height}
        draggable={false}
        onLoad={handleDesignLoad}
      />
    </Show>
  );
}
