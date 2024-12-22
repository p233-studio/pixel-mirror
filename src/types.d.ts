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
  position: GridSystemPosition;
  createdAt: number;
}

interface PersistState {
  designId: string | undefined;
  designOpacity: number;
  designPosition: { x: number; y: number };
  designScale: 0.5 | 1;
  showDesignOverlay: boolean;
  lockDesignOverlay: boolean;
  showVerticalRhythmOverlay: boolean;
  verticalRhythmHeight: string;
  verticalRhythmColor: string;
  showGridSystemOverlay: boolean;
  activeGridSystemId: string | undefined;
  gridSystemColor: string;
  appPosition: "top" | "bottom";
}

interface MemoryState {
  showAlignmentPopover: boolean;
  showGridSettingsPanel: boolean;
  showAllDesignsPanel: boolean;
  designUrl: string | undefined;
  designSize: { width: number; height: number };
  designOriginalSize: { width: number; height: number };
  designBufferedPosition: { x: number; y: number };
  isSolidMode: boolean;
  isZoomMode: boolean;
  isDragging: boolean;
  enableAnimation: boolean;
  errorMessage: string | undefined;
}

type AlignmentPosition = "top" | "right" | "bottom" | "left" | "center" | "top-center";

type GridSystemPosition = "left" | "center" | "right";
