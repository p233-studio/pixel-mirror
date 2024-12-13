import clsx from "clsx";
import { onMount, createSignal, createEffect, createMemo, onCleanup, Show, For } from "solid-js";
import DesignDB from "./stores/designDB";
import { persistState, updatePersistState } from "./stores/persistState";
import { memoryState, setMemoryState } from "./stores/memoryState";
import css from "./App.module.scss";

import IconDesignShow from "~/assets/image-02-stroke-rounded.svg";
import IconDesignHide from "~/assets/image-not-found-01-stroke-rounded.svg";
import IconDesignFolder from "~/assets/folder-upload-stroke-rounded.svg";

import IconAlignment from "~/assets/coordinate-01-stroke-rounded.svg";
import IconAlignmentTop from "~/assets/align-top-stroke-rounded.svg";
import IconAlignmentBottom from "~/assets/align-bottom-stroke-rounded.svg";
import IconAlignmentLeft from "~/assets/align-left-stroke-rounded.svg";
import IconAlignmentRight from "~/assets/align-right-stroke-rounded.svg";
import IconAlignmentCenter from "~/assets/align-horizontal-center-stroke-rounded.svg";

import IconGridShow from "~/assets/grid-stroke-rounded.svg";
// import IconGridHide from "~/assets/grid-off-stroke-rounded.svg";

import IconScale from "~/assets/border-all-02-stroke-rounded.svg";
import IconZoom from "~/assets/search-add-stroke-rounded.svg";

import IconLock from "~/assets/square-lock-02-stroke-rounded.svg";
import IconUnlock from "~/assets/square-unlock-02-stroke-rounded.svg";

import IconOpacity from "~/assets/idea-01-stroke-rounded.svg";
import IconSettings from "~/assets/settings-02-stroke-rounded.svg";
import IconDrag from "~/assets/drag-drop-vertical-stroke-rounded.svg";

export default function App() {
  const [pageHeight, setPageHeight] = createSignal(0);

  onMount(() => {
    // Instead of modifying the host project's HTML element with `position: relative`,
    // we use ResizeObserver to detect the actual scrollHeight.
    // This ensures zero style interference with the host project.
    const updateHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(document.documentElement);

    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  const dimensions = createMemo(() => {
    // Control menubar morphing through manual size adjustments
    if (memoryState.showDesignsPanel) {
      return { width: "800px", height: "640px" };
    }
    if (memoryState.showSettingsPanel) {
      return { width: "640px", height: "360px" };
    }
    return { width: "408px", height: "48px" };
  });

  const toggleDesignVisible = () => {
    updatePersistState({ isDesignVisible: !persistState.isDesignVisible });
  };

  const toggleDesignLock = () => {
    updatePersistState({ isDesignLocked: !persistState.isDesignLocked });
  };

  const resetDesignOpacity = () => {
    updatePersistState({ desginOpacity: 0.5 });
  };

  const showAlignmentPop = () => {
    setMemoryState("showAlignmentPopover", true);
  };

  const hideAlignmentPop = (e: MouseEvent) => {
    const target = e.relatedTarget as Element | null;
    if (!target?.closest("#alignment-popover")) {
      setMemoryState("showAlignmentPopover", false);
    }
  };

  const adjustDesignAlignment = (position: AlignmentPosition) => {
    const { clientWidth, scrollHeight } = document.documentElement;
    const { width, height } = memoryState.designSize;
    const { x, y } = persistState.designPosition;
    const newPosition = {
      top: { x, y: 0 },
      right: { x: clientWidth - width, y },
      bottom: { x, y: scrollHeight - height },
      left: { x: 0, y },
      center: { x: ((clientWidth - width) / 2) | 0, y },
      "top-center": { x: ((clientWidth - width) / 2) | 0, y: 0 }
    }[position];

    // Skip dangling transitions when position remains unchanged
    if (newPosition.x === x && newPosition.y === y) return;
    setMemoryState({
      designCachedPosition: newPosition,
      enableAnimation: true
    });
    updatePersistState({ designPosition: newPosition });
  };

  const adjustDesignScale = () => {
    const scale = persistState.designScale === 0.5 ? 1 : 0.5;
    setMemoryState({
      designSize: {
        width: memoryState.designOriginalSize.width * scale,
        height: memoryState.designOriginalSize.height * scale
      },
      enableAnimation: true
    });
    updatePersistState({
      designScale: scale
    });
  };

  const toggleDesignsPanel = () => {
    setMemoryState("showDesignsPanel", !memoryState.showDesignsPanel);
  };

  const toggleSettingsPanel = () => {
    setMemoryState("showSettingsPanel", !memoryState.showSettingsPanel);
  };

  return (
    <>
      <div class={css.fullPageContainer} style={{ height: `${pageHeight()}px` }}>
        <DesignOverlay />
      </div>

      <div
        class={clsx(css.app, memoryState.isSolidMode && css.hide, memoryState.isDragging && css.noEvents)}
        style={dimensions()}
      >
        <div class={clsx(css.menuBar, (memoryState.showDesignsPanel || memoryState.showSettingsPanel) && css.hide)}>
          <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleDesignVisible}>
            <Show when={persistState.isDesignVisible} fallback={<IconDesignHide />}>
              <IconDesignShow />
            </Show>
          </button>
          <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleDesignLock}>
            <Show when={persistState.isDesignLocked} fallback={<IconUnlock />}>
              <IconLock />
            </Show>
          </button>
          <button class={clsx(css.menuButton, css.actionButton, css.opacityButton)} onClick={resetDesignOpacity}>
            <span class={css.opacityButton__value}>{Math.floor(persistState.desginOpacity * 100)}</span>
            <IconOpacity />
          </button>
          <button
            class={clsx(css.menuButton, css.actionButton)}
            onClick={() => adjustDesignAlignment("top-center")}
            onMouseEnter={showAlignmentPop}
            onMouseLeave={hideAlignmentPop}
          >
            <IconAlignment />
          </button>
          <button class={clsx(css.menuButton, css.actionButton, css.scaleButton)} onClick={adjustDesignScale}>
            <Show when={!memoryState.isSolidMode} fallback={<IconZoom class={css.scaleButton__icon} />}>
              <span class={css.scaleButton__value}>
                {persistState.designScale === 0.5 ? ".5" : persistState.designScale.toString()}x
              </span>
            </Show>
            <IconScale />
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

        <div
          class={clsx(
            css.coordinates,
            (!persistState.isDesignVisible ||
              memoryState.showAlignmentPopover ||
              memoryState.showDesignsPanel ||
              memoryState.showSettingsPanel) &&
              css.hide
          )}
        >
          x:{memoryState.designCachedPosition.x}, y:{memoryState.designCachedPosition.y}
        </div>

        <div
          id="alignment-popover"
          class={clsx(css.alignmentPopover, !memoryState.showAlignmentPopover && css.hide)}
          onMouseLeave={hideAlignmentPop}
        >
          <button class={clsx(css.alignmentButton, css.actionButton)} onClick={() => adjustDesignAlignment("left")}>
            <IconAlignmentLeft />
          </button>
          <button class={clsx(css.alignmentButton, css.actionButton)} onClick={() => adjustDesignAlignment("top")}>
            <IconAlignmentTop />
          </button>
          <button class={clsx(css.alignmentButton, css.actionButton)} onClick={() => adjustDesignAlignment("center")}>
            <IconAlignmentCenter />
          </button>
          <button class={clsx(css.alignmentButton, css.actionButton)} onClick={() => adjustDesignAlignment("bottom")}>
            <IconAlignmentBottom />
          </button>
          <button class={clsx(css.alignmentButton, css.actionButton)} onClick={() => adjustDesignAlignment("right")}>
            <IconAlignmentRight />
          </button>
        </div>

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
    setMemoryState({
      showDesignsPanel: false,
      enableAnimation: true
    });
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

  const handleDesignUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
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
      <input type="file" accept="image/jpeg,image/png" multiple onChange={(e) => void handleDesignUpload(e)} />
    </div>
  );
}

function DesignOverlay() {
  const overlayStyle = createMemo(() => {
    return {
      width: `${memoryState.designSize.width}px`,
      height: `${memoryState.designSize.height}px`,
      opacity: memoryState.isSolidMode ? 1 : persistState.desginOpacity,
      transform: `translate3D(${memoryState.designCachedPosition.x}px, ${memoryState.designCachedPosition.y}px, 0)`,
      cursor: memoryState.isSolidMode
        ? memoryState.isZoomMode
          ? "zoom-out"
          : "zoom-in"
        : memoryState.isDragging
          ? "grabbing"
          : "grab"
    };
  });

  const handleImageLoaded = (e: Event) => {
    const img = e.target as HTMLImageElement;
    setMemoryState({
      designSize: {
        width: img.naturalWidth * persistState.designScale,
        height: img.naturalHeight * persistState.designScale
      },
      designOriginalSize: {
        width: img.naturalWidth,
        height: img.naturalHeight
      },
      designCachedPosition: persistState.designPosition
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (memoryState.isSolidMode) {
      if (memoryState.isZoomMode) {
        // Exit zoom mode
        setMemoryState({
          isZoomMode: false,
          designSize: {
            width: memoryState.designOriginalSize.width * persistState.designScale,
            height: memoryState.designOriginalSize.height * persistState.designScale
          },
          designCachedPosition: persistState.designPosition,
          enableAnimation: true
        });
        window.removeEventListener("mousemove", handleZoomModeInverseMove);
      } else {
        // Enter zoom mode
        // Mousemove event listener will be attached after transition ends
        // Implementation details in handleTransitionEnd() function
        setMemoryState({
          isZoomMode: true,
          designSize: {
            width: memoryState.designSize.width * 2,
            height: memoryState.designSize.height * 2
          },
          designCachedPosition: {
            x: innerWidth / 2 - (e.clientX - memoryState.designCachedPosition.x) * 2,
            y: innerHeight / 2 - (e.clientY - memoryState.designCachedPosition.y) * 2
          },
          enableAnimation: true
        });
      }
    } else if (!persistState.isDesignLocked) {
      // Start dragging
      setMemoryState("isDragging", true);
      window.addEventListener("mousemove", handleDragMove);
    }
  };

  const handleDragMove = (e: MouseEvent) => {
    setMemoryState("designCachedPosition", (prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleZoomModeInverseMove = (e: MouseEvent) => {
    setMemoryState("designCachedPosition", (prev) => ({
      x: prev.x - e.movementX,
      y: prev.y - e.movementY
    }));
  };

  const handleMouseUp = (e: MouseEvent) => {
    // Stop dragging
    if (e.button !== 0 || !memoryState.isDragging) return;
    setMemoryState("isDragging", false);
    updatePersistState({ designPosition: memoryState.designCachedPosition });
    window.removeEventListener("mousemove", handleDragMove);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Control") {
      // Enable opacity control
      window.addEventListener("wheel", handleWheel, { passive: false });
    } else if (e.key === " ") {
      // Block spacebar page scrolling while overlay is visible
      // Enable solid mode exclusively in non-dragging state
      e.preventDefault();
      if (!memoryState.isDragging) {
        setMemoryState("isSolidMode", true);
      }
    } else if (e.key.startsWith("Arrow")) {
      // Move overlay with arrow keys
      e.preventDefault();
      const [dx, dy] = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
      }[e.key] || [0, 0];
      setMemoryState("designCachedPosition", {
        x: persistState.designPosition.x + dx,
        y: persistState.designPosition.y + dy
      });
    } else if (e.key === "Escape") {
      updatePersistState({ isDesignLocked: !persistState.isDesignLocked });
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Control") {
      // Disable opacity control
      window.removeEventListener("wheel", handleWheel);
    } else if (e.key === " ") {
      if (memoryState.isZoomMode) {
        // Exit solid mode and zoom mode
        setMemoryState({
          isSolidMode: false,
          isZoomMode: false,
          designSize: {
            width: memoryState.designOriginalSize.width * persistState.designScale,
            height: memoryState.designOriginalSize.height * persistState.designScale
          },
          designCachedPosition: persistState.designPosition,
          enableAnimation: true
        });
        window.removeEventListener("mousemove", handleZoomModeInverseMove);
      } else {
        // Exit solid mode
        setMemoryState("isSolidMode", false);
      }
    } else if (e.key.startsWith("Arrow")) {
      // Update persisted position on keyup
      updatePersistState({ designPosition: memoryState.designCachedPosition });
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.05 : -0.05;
    const newOpacity = Math.round((persistState.desginOpacity + delta) * 100) / 100;
    updatePersistState({ desginOpacity: Math.max(0.1, Math.min(0.9, newOpacity)) });
  };

  const handleTransitionEnd = () => {
    // Enable overlay transition manually, auto-disable after animation completes
    setMemoryState("enableAnimation", false);
    // Delay zoom mode movement until transition ends
    if (memoryState.isZoomMode) {
      window.addEventListener("mousemove", handleZoomModeInverseMove);
    }
  };

  createEffect(() => {
    if (!persistState.designId) return;
    DesignDB.getDesign(persistState.designId)
      .then((design) => {
        if (!design) {
          throw new Error("Failed to load design image.");
        }
        const blob = new Blob([design.buffer], { type: design.mimeType });
        const url = URL.createObjectURL(blob);
        setMemoryState("designUrl", url);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  createEffect(() => {
    if (persistState.isDesignVisible) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    }
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });

  return (
    <img
      alt=""
      src={memoryState.designUrl}
      class={clsx(
        css.overlay,
        memoryState.isSolidMode && css.solid,
        memoryState.enableAnimation && css.animation,
        persistState.isDesignLocked && !memoryState.isSolidMode && css.locked,
        (!memoryState.designUrl || !persistState.isDesignVisible) && css.hide
      )}
      style={overlayStyle()}
      onLoad={handleImageLoaded}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTransitionEnd={handleTransitionEnd}
      draggable={false}
    />
  );
}
