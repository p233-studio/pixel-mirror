interface Design {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
  createdAt: number;
}

interface GridSet {
  id: string;
  width: string;
  columns: number;
  gutterWidth: string;
  isGutterOnOutside: boolean;
  position: GridPosition;
  createdAt: number;
}

interface PersistState {
  designId: string | undefined;
  desginOpacity: number;
  designPosition: { x: number; y: number };
  designScale: 0.5 | 1;
  lockDesignOverlay: boolean;
  showDesignOverlay: boolean;
  showVerticalRhythmOverlay: boolean;
  verticalRhythmHeight: string;
  verticalRhythmGridColor: string;
  showGridSystemOverlay: boolean;
  activeGridSystemId: string | undefined;
  gridSystemColor: string;
  appPosition: "top" | "bottom";
}

interface MemoryState {
  showAlignmentPopover: boolean;
  showDesignListPanel: boolean;
  showGridSettingsPanel: boolean;
  designUrl: string | undefined;
  designSize: { width: number; height: number };
  designOriginalSize: { width: number; height: number };
  designCachedPosition: { x: number; y: number };
  isSolidMode: boolean;
  isZoomMode: boolean;
  isDragging: boolean;
  enableAnimation: boolean;
  errorMessage: string | undefined;
}

type AlignmentPosition = "top" | "right" | "bottom" | "left" | "center" | "top-center";

type GridPosition = "left" | "center" | "right";
