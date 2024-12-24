import clsx from "clsx";
import { onMount, createSignal, createEffect, createMemo, onCleanup, Show, For } from "solid-js";
import JigsawDB from "./stores/JigsawDB";
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
import IconScale from "~/assets/border-all-02-stroke-rounded.svg";
import IconLock from "~/assets/square-lock-02-stroke-rounded.svg";
import IconUnlock from "~/assets/square-unlock-02-stroke-rounded.svg";
import IconOpacity from "~/assets/idea-01-stroke-rounded.svg";
import IconGridSettings from "~/assets/grid-table-stroke-rounded.svg";
import IconRelocate from "~/assets/flip-top-stroke-rounded.svg";
import IconWarning from "~/assets/alert-02-stroke-rounded.svg";
import IconDelete from "~/assets/delete-02-stroke-rounded.svg";
import IconTick from "~/assets/checkmark-circle-02-stroke-rounded.svg";
import IconUpload from "~/assets/image-upload-stroke-rounded.svg";
import IconToggle from "~/assets/toggle-on-stroke-rounded.svg";

function toastErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "An error occurred.";
  setMemoryState("errorMessage", message);
  console.error(message);
}

export default function App() {
  const [isReady, setIsReady] = createSignal(false);

  const dimensions = createMemo(() => {
    // Control menubar morphing through manual size adjustments
    if (memoryState.showAllDesignsPanel) {
      return { width: "800px", height: "600px" };
    }
    if (memoryState.showGridSettingsPanel) {
      return { width: "680px", height: "600px" };
    }
    return { width: "380px", height: "48px" };
  });

  onMount(() => {
    JigsawDB.init()
      .then(() => setIsReady(true))
      .catch(toastErrorMessage);
  });

  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest("#_jigsaw-app")) {
      setMemoryState({
        showAllDesignsPanel: false,
        showGridSettingsPanel: false
      });
      window.removeEventListener("mousedown", handleOutsideClick);
    }
  };

  createEffect(() => {
    if (!memoryState.showAllDesignsPanel && !memoryState.showGridSettingsPanel) return;
    window.addEventListener("mousedown", handleOutsideClick);
    onCleanup(() => {
      window.removeEventListener("mousedown", handleOutsideClick);
    });
  });

  const toggleDesignVisible = () => {
    updatePersistState({ showDesignOverlay: !persistState.showDesignOverlay });
  };

  const toggleDesignLock = () => {
    updatePersistState({ lockDesignOverlay: !persistState.lockDesignOverlay });
  };

  const resetDesignOpacity = () => {
    updatePersistState({ designOpacity: 0.5 });
  };

  const showAlignmentPop = () => {
    if (!persistState.showDesignOverlay) return;
    setMemoryState("showAlignmentPopover", true);
  };

  const hideAlignmentPop = (e: MouseEvent) => {
    const target = e.relatedTarget as Element | null;
    if (!target?.closest("#_jigsaw-popover")) {
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
      designBufferedPosition: newPosition,
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
    updatePersistState({ designScale: scale });
  };

  const changeAppPosition = () => {
    const newPosition = persistState.appPosition === "top" ? "bottom" : "top";
    updatePersistState({ appPosition: newPosition });
  };

  return (
    <Show when={isReady()}>
      <div class={css.overlayContainer}>
        <DesignOverlay />
        <Show when={persistState.showVerticalRhythmOverlay && !memoryState.isZoomMode}>
          <VerticalRhythmOverlay />
        </Show>
        <Show when={persistState.showGridSystemOverlay && !memoryState.isZoomMode}>
          <GridSystemOverlay />
        </Show>
      </div>

      <div
        id="_jigsaw-app"
        class={clsx(
          css.app,
          memoryState.isSolidMode && css.hide,
          memoryState.isDragging && css.noEvents,
          persistState.appPosition === "top" && css.top
        )}
        style={dimensions()}
      >
        <Show when={!!memoryState.errorMessage}>
          <Toast />
        </Show>

        <div
          class={clsx(css.menuBar, (memoryState.showAllDesignsPanel || memoryState.showGridSettingsPanel) && css.hide)}
        >
          <button class={css.menuButton} onClick={toggleDesignVisible} disabled={!memoryState.designUrl}>
            <Show when={persistState.showDesignOverlay} fallback={<IconDesignHide />}>
              <IconDesignShow />
            </Show>
          </button>
          <button class={css.menuButton} onClick={toggleDesignLock} disabled={!persistState.showDesignOverlay}>
            <Show when={persistState.lockDesignOverlay} fallback={<IconUnlock />}>
              <IconLock />
            </Show>
          </button>
          <button
            class={clsx(css.menuButton, css.opacityButton)}
            onClick={resetDesignOpacity}
            disabled={!persistState.showDesignOverlay}
          >
            <span class={css.opacityButton__value}>{Math.floor(persistState.designOpacity * 100)}</span>
            <IconOpacity />
          </button>
          <button
            class={css.menuButton}
            onClick={() => adjustDesignAlignment("top-center")}
            onMouseEnter={showAlignmentPop}
            onMouseLeave={hideAlignmentPop}
            disabled={!persistState.showDesignOverlay}
          >
            <IconAlignment />
          </button>
          <button
            class={clsx(css.menuButton, css.scaleButton)}
            onClick={adjustDesignScale}
            disabled={!persistState.showDesignOverlay}
          >
            <span class={css.scaleButton__value}>
              {persistState.designScale === 0.5 ? ".5" : persistState.designScale.toString()}x
            </span>
            <IconScale />
          </button>
          <button class={css.menuButton} onClick={() => setMemoryState("showGridSettingsPanel", true)}>
            <IconGridSettings />
          </button>
          <button class={css.menuButton} onClick={() => setMemoryState("showAllDesignsPanel", true)}>
            <IconDesignFolder />
          </button>
          <button
            class={clsx(css.menuButton, persistState.appPosition === "top" && css.rotate)}
            onClick={changeAppPosition}
          >
            <IconRelocate />
          </button>
        </div>

        <div
          class={clsx(
            css.coordinates,
            (!persistState.showDesignOverlay ||
              memoryState.showAlignmentPopover ||
              memoryState.showAllDesignsPanel ||
              memoryState.showGridSettingsPanel) &&
              css.hide
          )}
        >
          x:{memoryState.designBufferedPosition.x}, y:{memoryState.designBufferedPosition.y}
        </div>

        <div
          id="_jigsaw-popover"
          class={clsx(css.alignmentPopover, !memoryState.showAlignmentPopover && css.hide)}
          onMouseLeave={hideAlignmentPop}
        >
          <button class={css.alignmentButton} onClick={() => adjustDesignAlignment("left")}>
            <IconAlignmentLeft />
          </button>
          <button class={css.alignmentButton} onClick={() => adjustDesignAlignment("top")}>
            <IconAlignmentTop />
          </button>
          <button class={css.alignmentButton} onClick={() => adjustDesignAlignment("center")}>
            <IconAlignmentCenter />
          </button>
          <button class={css.alignmentButton} onClick={() => adjustDesignAlignment("bottom")}>
            <IconAlignmentBottom />
          </button>
          <button class={css.alignmentButton} onClick={() => adjustDesignAlignment("right")}>
            <IconAlignmentRight />
          </button>
        </div>

        <Show when={memoryState.showGridSettingsPanel}>
          <GridSettingsPanel />
        </Show>

        <Show when={memoryState.showAllDesignsPanel}>
          <AllDesignsPanel />
        </Show>
      </div>
    </Show>
  );
}

function GridSettingsPanel() {
  const [verticalRhythmHeight, setVerticalRhythmHeight] = createSignal(persistState.verticalRhythmHeight);
  const [verticalRhythmColor, setVerticalRhythmColor] = createSignal(persistState.verticalRhythmColor);
  const [gridSetArray, setGridSetArray] = createSignal<GridSet[]>([]);
  const [gridSystemColor, setGridSystemColor] = createSignal(persistState.gridSystemColor);
  const [gridContainerWidth, setGridContainerWidth] = createSignal("");
  const [gridColumns, setGridColumns] = createSignal("");
  const [gutterWidth, setGutterWidth] = createSignal("");
  const [isGutterOnOutside, setIsGutterOnOutside] = createSignal(true);
  const [gridContainerPosition, setGridContainerPosition] = createSignal<GridSystemPosition>("center");

  onMount(() => {
    JigsawDB.getAllGridSets()
      .then((gridSets) => setGridSetArray(gridSets))
      .catch(toastErrorMessage);
  });

  const toggleVerticalRhythmGuide = () => {
    updatePersistState({ showVerticalRhythmOverlay: !persistState.showVerticalRhythmOverlay });
  };

  const updateVerticalRhythmHeight = () => {
    updatePersistState({ verticalRhythmHeight: verticalRhythmHeight() });
  };

  const updateVerticalRhythmColor = () => {
    updatePersistState({ verticalRhythmColor: verticalRhythmColor() });
  };

  const toggleGridSystemGuide = () => {
    updatePersistState({ showGridSystemOverlay: !persistState.showGridSystemOverlay });
  };

  const updateGridSystemColor = () => {
    updatePersistState({ gridSystemColor: gridSystemColor() });
  };

  const createGridSet = () => {
    const gridSetData = {
      width: /^\d+$/.test(gridContainerWidth()) ? `${gridContainerWidth()}px` : gridContainerWidth(),
      columns: +gridColumns(),
      gutterWidth: /^\d+$/.test(gutterWidth()) ? `${gutterWidth()}px` : gutterWidth(),
      isGutterOnOutside: isGutterOnOutside(),
      position: gridContainerPosition()
    };
    JigsawDB.addGridSet(gridSetData)
      .then((gridSet) => {
        setGridSetArray((prev) => [...prev, gridSet]);
        setGridContainerWidth("");
        setGridColumns("");
        setGutterWidth("");
        setIsGutterOnOutside(true);
        setGridContainerPosition("center");
      })
      .catch(toastErrorMessage);
  };

  const deleteGridSet = (id: string) => {
    JigsawDB.deleteGridSet(id)
      .then(() => {
        setGridSetArray((prev) => prev.filter((gridSet) => gridSet.id !== id));
      })
      .catch(toastErrorMessage);
  };

  const activeGridSet = (id: string) => {
    updatePersistState({ activeGridSystemId: id });
  };

  const resetGridSettings = () => {
    JigsawDB.resetGridSets()
      .then((defaultArray) => {
        setGridSetArray(defaultArray);
        updatePersistState({ activeGridSystemId: "default" });
      })
      .catch(toastErrorMessage);
  };

  return (
    <div class={css.panel}>
      <div class={css.panel__contentWrapper}>
        <div class={clsx(css.panel__content, !!gridSetArray().length && css.show)}>
          <div class={css.gridSettingBox}>
            <div class={css.gridSettingBox__header}>
              <h3 class={css.gridSettingBox__heading}>Vertical Rhythm</h3>
              <button
                class={clsx(css.gridSettingBox__toggleButton, persistState.showVerticalRhythmOverlay && css.enabled)}
                onClick={toggleVerticalRhythmGuide}
              >
                <IconToggle />
                <span>{persistState.showVerticalRhythmOverlay ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
            <fieldset class={css.fieldset}>
              <legend>Vertical Rhythm Height</legend>
              <input
                spellcheck={false}
                type="text"
                value={verticalRhythmHeight()}
                onInput={(e) => setVerticalRhythmHeight(e.target.value)}
                style={{
                  "font-style": verticalRhythmHeight() !== persistState.verticalRhythmHeight ? "italic" : undefined
                }}
              />
              <button onClick={updateVerticalRhythmHeight}>Update</button>
            </fieldset>
            <fieldset class={css.fieldset} style={{ background: verticalRhythmColor() }}>
              <legend>Vertical Rhythm Color</legend>
              <input
                spellcheck={false}
                type="text"
                value={verticalRhythmColor()}
                onInput={(e) => setVerticalRhythmColor(e.target.value)}
                style={{
                  "font-style": verticalRhythmColor() !== persistState.verticalRhythmColor ? "italic" : undefined
                }}
              />
              <button onClick={updateVerticalRhythmColor}>Update</button>
            </fieldset>
          </div>
          <div class={css.gridSettingBox}>
            <div class={css.gridSettingBox__header}>
              <h3 class={css.gridSettingBox__heading}>Grid System</h3>
              <button
                class={clsx(css.gridSettingBox__toggleButton, persistState.showGridSystemOverlay && css.enabled)}
                onClick={toggleGridSystemGuide}
              >
                <IconToggle />
                <span>{persistState.showGridSystemOverlay ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
            <fieldset class={css.fieldset} style={{ background: gridSystemColor() }}>
              <legend>Grid System Color</legend>
              <input
                spellcheck={false}
                type="text"
                value={gridSystemColor()}
                onInput={(e) => setGridSystemColor(e.target.value)}
                style={{
                  "font-style": gridSystemColor() !== persistState.gridSystemColor ? "italic" : undefined
                }}
              />
              <button onClick={updateGridSystemColor}>Update</button>
            </fieldset>
            <div class={css.tableWrapper}>
              <table class={css.table}>
                <thead>
                  <tr>
                    <th>Width</th>
                    <th>Columns</th>
                    <th>Gutter Width</th>
                    <th>Outer Gutter</th>
                    <th>Position</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {
                    <For each={gridSetArray()}>
                      {(gridSet) => (
                        <tr class={clsx(persistState.activeGridSystemId === gridSet.id && css.active)}>
                          <td>{gridSet.width}</td>
                          <td>{gridSet.columns}</td>
                          <td>{gridSet.gutterWidth}</td>
                          <td>{gridSet.isGutterOnOutside ? "Yes" : "No"}</td>
                          <td>{gridSet.position}</td>
                          <td class={css.table__bgroup}>
                            <button
                              class={css.table__button}
                              onClick={() => deleteGridSet(gridSet.id)}
                              disabled={gridSetArray().length == 1 || persistState.activeGridSystemId === gridSet.id}
                            >
                              <IconDelete />
                            </button>
                            <button
                              class={clsx(
                                css.table__button,
                                css.activeGridButton,
                                persistState.activeGridSystemId === gridSet.id && css.active
                              )}
                              onClick={() => activeGridSet(gridSet.id)}
                              disabled={persistState.activeGridSystemId === gridSet.id}
                            >
                              <IconTick />
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  }
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <input
                        spellcheck={false}
                        type="text"
                        placeholder="1140px"
                        value={gridContainerWidth()}
                        onInput={(e) => setGridContainerWidth(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        spellcheck={false}
                        type="text"
                        placeholder="12"
                        value={gridColumns()}
                        onInput={(e) => setGridColumns(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        spellcheck={false}
                        type="text"
                        placeholder="24px"
                        value={gutterWidth()}
                        onInput={(e) => setGutterWidth(e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={Number(isGutterOnOutside())}
                        onChange={(e) => setIsGutterOnOutside(Boolean(+e.target.value))}
                      >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={gridContainerPosition()}
                        onChange={(e) => setGridContainerPosition(e.target.value as GridSystemPosition)}
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </td>
                    <td colspan={2}>
                      <button
                        class={css.addGridButton}
                        onClick={createGridSet}
                        disabled={!gridContainerWidth() || !gridColumns() || !gutterWidth()}
                      >
                        Add Grid
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class={css.panel__footer}>
        <button class={css.panel__button} onClick={resetGridSettings}>
          Reset Grid Settings
        </button>
        <button class={css.panel__button} onClick={() => setMemoryState("showGridSettingsPanel", false)}>
          Close
        </button>
      </div>
    </div>
  );
}

function DesignCard(props: Design & { selectDesign: (id: string) => void; deleteDesign: (id: string) => void }) {
  const [imgUrl, setImgUrl] = createSignal("");

  onMount(() => {
    const blob = new Blob([props.buffer], { type: props.mimeType });
    const url = URL.createObjectURL(blob);
    setImgUrl(url);
  });

  onCleanup(() => {
    URL.revokeObjectURL(imgUrl());
  });

  return (
    <div class={clsx(css.designCard, persistState.designId === props.id && css.current)}>
      <img
        class={css.designCard__img}
        src={imgUrl()}
        draggable={false}
        onClick={() => props.selectDesign(props.id)}
        alt=""
      />
      <button
        class={css.designCard__button}
        onClick={() => props.deleteDesign(props.id)}
        disabled={persistState.designId === props.id}
      >
        <IconDelete />
      </button>
    </div>
  );
}

function AllDesignsPanel() {
  const [isReady, setIsReady] = createSignal(false);
  const [designArray, setDesignArray] = createSignal<Design[]>([]);

  onMount(() => {
    JigsawDB.getAllDesigns()
      .then((designs) => {
        setDesignArray(designs);
        setIsReady(true);
      })
      .catch(toastErrorMessage);
  });

  const uploadDesigns = (files: File[]) => {
    if (files.length === 0) return;

    JigsawDB.uploadDesign(files)
      .then((newAddedDesigns) => setDesignArray((prev) => [...newAddedDesigns, ...prev]))
      .catch(toastErrorMessage);
  };

  const handleInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    uploadDesigns(files);
  };

  const handleDesignsDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []).filter((i) => ["image/jpeg", "image/png"].includes(i.type));
    uploadDesigns(files);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const selectDesign = (id: string) => {
    if (persistState.designId === id) return;
    updatePersistState({
      designId: id,
      showDesignOverlay: true
    });
    setMemoryState("showAllDesignsPanel", false);
  };

  const deleteDesign = (id: string) => {
    JigsawDB.deleteDesign(id)
      .then(() => setDesignArray((prev) => prev.filter((design) => design.id !== id)))
      .catch(toastErrorMessage);
  };

  const deleteAllDesigns = () => {
    JigsawDB.deleteAllDesigns()
      .then(() => {
        setDesignArray([]);
        updatePersistState({
          designId: "",
          showDesignOverlay: false
        });
        if (memoryState.designUrl) {
          URL.revokeObjectURL(memoryState.designUrl);
          setMemoryState("designUrl", undefined);
        }
      })
      .catch(toastErrorMessage);
  };

  return (
    <div class={css.panel}>
      <div class={css.panel__contentWrapper}>
        <div
          class={clsx(css.panel__content, isReady() && css.show)}
          onDrop={handleDesignsDrop}
          onDragOver={handleDragOver}
        >
          <div class={css.allDesignsList}>
            <label class={css.uploadButton}>
              <IconUpload class={css.uploadButton__icon} />
              <span class={css.uploadButton__text}>Upload</span>
              <input type="file" accept="image/jpeg,image/png" multiple onChange={handleInputChange} />
            </label>
            {
              <For each={designArray()}>
                {(design) => <DesignCard {...design} selectDesign={selectDesign} deleteDesign={deleteDesign} />}
              </For>
            }
          </div>
        </div>
      </div>
      <div class={css.panel__footer}>
        <Show when={!!designArray().length}>
          <button class={css.panel__button} onClick={deleteAllDesigns}>
            Clear Designs
          </button>
        </Show>
        <button class={css.panel__button} onClick={() => setMemoryState("showAllDesignsPanel", false)}>
          Close
        </button>
      </div>
    </div>
  );
}

function DesignOverlay() {
  createEffect(() => {
    if (!persistState.designId) return;
    JigsawDB.getDesign(persistState.designId)
      .then((design) => {
        if (!design) {
          throw new Error("Failed to load design image.");
        }
        const blob = new Blob([design.buffer], { type: design.mimeType });
        const url = URL.createObjectURL(blob);
        setMemoryState("designUrl", url);
      })
      .catch(toastErrorMessage);
  });

  createEffect(() => {
    if (persistState.showDesignOverlay) {
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

  const overlayStyle = createMemo(() => {
    return {
      width: `${memoryState.designSize.width}px`,
      height: `${memoryState.designSize.height}px`,
      opacity: memoryState.isSolidMode ? 1 : persistState.designOpacity,
      transform: `translate3D(${memoryState.designBufferedPosition.x}px, ${memoryState.designBufferedPosition.y}px, 0)`,
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
      designBufferedPosition: persistState.designPosition
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
          designBufferedPosition: persistState.designPosition,
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
          designBufferedPosition: {
            x: innerWidth / 2 - (e.clientX - memoryState.designBufferedPosition.x) * 2,
            y: innerHeight / 2 - (e.clientY - memoryState.designBufferedPosition.y) * 2
          },
          enableAnimation: true
        });
      }
    } else if (!persistState.lockDesignOverlay) {
      // Start dragging
      setMemoryState("isDragging", true);
      window.addEventListener("mousemove", handleDragMove);
    }
  };

  const handleDragMove = (e: MouseEvent) => {
    setMemoryState("designBufferedPosition", (prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleZoomModeInverseMove = (e: MouseEvent) => {
    setMemoryState("designBufferedPosition", (prev) => ({
      x: prev.x - e.movementX,
      y: prev.y - e.movementY
    }));
  };

  const handleMouseUp = (e: MouseEvent) => {
    // Stop dragging
    if (e.button !== 0 || !memoryState.isDragging) return;
    setMemoryState("isDragging", false);
    updatePersistState({ designPosition: memoryState.designBufferedPosition });
    window.removeEventListener("mousemove", handleDragMove);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["INPUT", "SELECT"].includes((e.target as Element).tagName)) return;

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
      setMemoryState("designBufferedPosition", {
        x: persistState.designPosition.x + dx,
        y: persistState.designPosition.y + dy
      });
    } else if (e.key === "Escape") {
      updatePersistState({ lockDesignOverlay: !persistState.lockDesignOverlay });
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (["INPUT", "SELECT"].includes((e.target as Element).tagName)) return;

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
          designBufferedPosition: persistState.designPosition,
          enableAnimation: true
        });
        window.removeEventListener("mousemove", handleZoomModeInverseMove);
      } else {
        // Exit solid mode
        setMemoryState("isSolidMode", false);
      }
    } else if (e.key.startsWith("Arrow")) {
      // Update persisted position on keyup
      updatePersistState({ designPosition: memoryState.designBufferedPosition });
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.05 : -0.05;
    const newOpacity = Math.round((persistState.designOpacity + delta) * 100) / 100;
    updatePersistState({ designOpacity: Math.max(0.1, Math.min(0.9, newOpacity)) });
  };

  const handleTransitionEnd = () => {
    // Enable overlay transition manually, auto-disable after animation completes
    setMemoryState("enableAnimation", false);
    // Delay zoom mode movement until transition ends
    if (memoryState.isZoomMode) {
      window.addEventListener("mousemove", handleZoomModeInverseMove);
    }
  };

  return (
    <img
      alt=""
      src={memoryState.designUrl}
      class={clsx(
        css.designOverlay,
        memoryState.isSolidMode && css.solid,
        memoryState.enableAnimation && css.animation,
        persistState.lockDesignOverlay && !memoryState.isSolidMode && css.locked,
        (!memoryState.designUrl || !persistState.showDesignOverlay) && css.hide
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

function VerticalRhythmOverlay() {
  return (
    <div
      class={css.verticalRhythmOverlay}
      style={{
        "background-image": `linear-gradient(to bottom, ${persistState.verticalRhythmColor} ${persistState.verticalRhythmHeight}, transparent ${persistState.verticalRhythmHeight})`,
        "background-size": `100% ${persistState.verticalRhythmHeight.replace(/\d+/, (n) => String(+n * 2))}`
      }}
    />
  );
}

function GridSystemOverlay() {
  const [gridSet, setGridSet] = createSignal<GridSet | undefined>(undefined);

  createEffect(() => {
    if (!persistState.activeGridSystemId) return;
    JigsawDB.getGridSet(persistState.activeGridSystemId)
      .then((gridSet) => {
        if (!gridSet) {
          throw new Error("Failed to load grid system.");
        }
        setGridSet(gridSet);
      })
      .catch(toastErrorMessage);
  });

  return (
    <Show when={!!gridSet()}>
      <div class={clsx(css.gridSystemOverlay, css[gridSet()!.position])}>
        <div
          style={{
            width: gridSet()!.width,
            "box-sizing": "border-box",
            "padding-left": gridSet()!.isGutterOnOutside
              ? gridSet()!.gutterWidth.replace(/\d+/, (n) => String(+n / 2))
              : undefined,
            "padding-right": gridSet()!.isGutterOnOutside
              ? gridSet()!.gutterWidth.replace(/\d+/, (n) => String(+n / 2))
              : undefined,
            display: "flex",
            gap: gridSet()!.gutterWidth
          }}
        >
          <For each={Array.from({ length: gridSet()!.columns })}>
            {() => <div style={{ flex: 1, background: persistState.gridSystemColor }} />}
          </For>
        </div>
      </div>
    </Show>
  );
}

function Toast() {
  onMount(() => {
    window.addEventListener("mousedown", closeToast);

    onCleanup(() => {
      window.removeEventListener("mousedown", closeToast);
    });
  });

  const closeToast = (e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest("#_jigsaw-toast")) {
      setMemoryState("errorMessage", undefined);
    }
  };

  return (
    <div id="_jigsaw-toast" class={css.toast}>
      <IconWarning />
      <span class={css.toast__message}>{memoryState.errorMessage}</span>
    </div>
  );
}
