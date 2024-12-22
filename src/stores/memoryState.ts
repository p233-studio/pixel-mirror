import { createStore } from "solid-js/store";

const defaultMemoryState = {
  showAlignmentPopover: false,
  showGridSettingsPanel: false,
  showAllDesginsPanel: false,
  designUrl: undefined,
  designSize: { width: 0, height: 0 },
  designOriginalSize: { width: 0, height: 0 },
  designCachedPosition: { x: 0, y: 0 },
  isSolidMode: false,
  isZoomMode: false,
  isDragging: false,
  enableAnimation: false,
  errorMessage: undefined
} satisfies MemoryState;

const [memoryState, setMemoryState] = createStore<MemoryState>(defaultMemoryState);

export { memoryState, setMemoryState };
