import clsx from "clsx";
import { createSignal, createMemo } from "solid-js";
import css from "./App.module.scss";

import IconImageShow from "~/assets/image-02-stroke-rounded.svg";
// import IconImageHide from "~/assets/image-not-found-01-stroke-rounded.svg";
import IconImageFolder from "~/assets/folder-upload-stroke-rounded.svg";

import IconAlignment from "~/assets/distribute-vertical-center-stroke-rounded.svg";
import IconAlignmentTop from "~/assets/arrow-up-05-stroke-rounded.svg";
import IconAlignmentBottom from "~/assets/arrow-down-05-stroke-rounded.svg";
import IconAlignmentLeft from "~/assets/arrow-left-05-stroke-rounded.svg";
import IconAlignmentRight from "~/assets/arrow-right-05-stroke-rounded.svg";

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
  const [alignmentPopoverVisible, setAlignmentPopoverVisible] = createSignal(false);
  const [imagesPanelVisible, setImagesPanelVisible] = createSignal(false);
  const [settingsPanelVisible, setSettingsPanelVisible] = createSignal(false);

  const dimensions = createMemo(() => {
    if (imagesPanelVisible()) {
      return {
        width: "760px",
        height: "240px"
      };
    }

    if (settingsPanelVisible()) {
      return {
        width: "640px",
        height: "360px"
      };
    }

    return {
      width: "408px",
      height: "48px"
    };
  });

  const showAlignmentPopover = () => {
    setAlignmentPopoverVisible(true);
  };

  const hideAlignmentPopover = (e: MouseEvent) => {
    const target = e.relatedTarget as Element | null;
    if (!target?.closest("#alignment-popover")) {
      setAlignmentPopoverVisible(false);
    }
  };

  const toggleImagesPanel = () => {
    setImagesPanelVisible(!imagesPanelVisible());
  };

  const toggleSettingsPanel = () => {
    setSettingsPanelVisible(!settingsPanelVisible());
  };

  return (
    <>
      <div class={css.app} style={dimensions()}>
        {!imagesPanelVisible() && !settingsPanelVisible() && (
          <div class={css.menuBar}>
            <button class={clsx(css.menuButton, css.actionButton)}>
              <IconImageShow />
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
            <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleImagesPanel}>
              <IconImageFolder />
            </button>
            <button class={clsx(css.menuButton, css.actionButton)} onClick={toggleSettingsPanel}>
              <IconSettings />
            </button>
            <button class={clsx(css.menuButton, css.grabButton)}>
              <IconDrag />
            </button>
          </div>
        )}

        {alignmentPopoverVisible() && (
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
              <IconAlignmentBottom />
            </button>
            <button class={clsx(css.alignmentButton, css.actionButton)}>
              <IconAlignmentRight />
            </button>
          </div>
        )}

        {imagesPanelVisible() && (
          <div class={css.panel}>
            <button class={css.panel__closeButton} onClick={toggleImagesPanel}>
              Close
            </button>
          </div>
        )}

        {settingsPanelVisible() && (
          <div class={css.panel}>
            <button class={css.panel__closeButton} onClick={toggleSettingsPanel}>
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
