interface Design {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
  createdAt: number;
}

interface PersistState {
  designId: string | undefined;
  desginOpacity: number;
  designPosition: { x: number; y: number };
  designScale: 0.5 | 1;
  isDesignLocked: boolean;
  isDesignVisible: boolean;
  isGridGuideVisible: boolean;
}

interface MemoryState {
  showAlignmentPopover: boolean;
  showDesignsPanel: boolean;
  showSettingsPanel: boolean;
  designUrl: string | undefined;
  designSize: { width: number; height: number };
  designOriginalSize: { width: number; height: number };
  designCachedPosition: { x: number; y: number };
  isSolidMode: boolean;
  isZoomMode: boolean;
  isDragging: boolean;
  enableAnimation: boolean;
}

type AlignmentPosition = "top" | "right" | "bottom" | "left" | "center" | "top-center";
