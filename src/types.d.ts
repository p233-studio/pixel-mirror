type MockupAlignment = "center" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Mockup {
  id: string;
  originalBuffer: ArrayBuffer;
  thumbnailBuffer: ArrayBuffer;
  filename: string;
  mimeType: string;
  createdAt: number;
}

interface GridConfig {
  id: string;
  width: string; // e.g. "1140px" or "100%"
  columns: number;
  gutterWidth: string;
  isGutterOnOutside: boolean;
  position: GridPosition;
  createdAt: number;
}

// Settings Type Definitions

interface MenubarSettings {
  position: "top" | "bottom";
}

interface MockupOverlaySettings {
  size: Size;
  isHidden: boolean;
  isLocked: boolean;
  opacity: number;
  position: Position;
  alignment: MockupAlignment;
}

interface GridOverlaySettings {
  showLayoutGrid: boolean;
  layoutGridColor: string;
  showVerticalRhythms: boolean;
  verticalRhythmsColor: string;
  verticalRhythmHeight: string;
}

interface AppSettings {
  menubar: MenubarSettings;
  "mockup-overlay": MockupOverlaySettings;
  "grid-overlay": GridOverlaySettings;
}

type SettingGroup = keyof AppSettings;
