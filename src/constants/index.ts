const DEFAULT_GRID_CONFIG: Omit<GridConfig, "createdAt"> = {
  id: "default",
  width: "1140px",
  columns: 12,
  gutterWidth: "24px",
  isGutterOnOutside: true,
  position: "center"
};

const THUMBNAIL_HEIGHT = 240;

const DEFAULT_APP_SETTINGS: AppSettings = {
  menubar: {
    position: "bottom"
  },
  "mockup-overlay": {
    size: { width: 300, height: 200 },
    isHidden: false,
    isLocked: false,
    opacity: 1,
    position: { x: 20, y: 20 },
    alignment: "top-left"
  },
  "grid-overlay": {
    showLayoutGrid: true,
    layoutGridColor: "rgba(255, 0, 0, 0.1)",
    showVerticalRhythms: false,
    verticalRhythmsColor: "rgba(0, 0, 255, 0.1)",
    verticalRhythmHeight: "24px"
  }
};

export { DEFAULT_APP_SETTINGS, DEFAULT_GRID_CONFIG, THUMBNAIL_HEIGHT };
