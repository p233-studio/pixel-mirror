// ============================================
// Grid Settings
// ============================================

const DEFAULT_GRID_TEMPLATE: Omit<LayoutGridConfig, "id" | "createdAt"> = {
  width: "1140px",
  columns: 12,
  gutterWidth: "24px",
  isGutterOnOutside: true,
  position: "center"
};

const DEFAULT_GRID_OVERLAY_SETTINGS: Omit<GridOverlaySettings, "activeLayoutGridId"> = {
  showLayoutGrid: false,
  layoutGridColor: "rgba(0, 0, 255, 0.05)",
  showSpacingGrid: false,
  spacingGridColor: "rgba(255, 0, 0, 0.05)",
  spacingGridHeight: "8px"
};

// ============================================
// Mockup Settings
// ============================================

const MOCKUP_THUMBNAIL_SIZE = 352;

// Opacity settings
const OPACITY_STEP = 0.05;
const OPACITY_MIN = 0.1;
const OPACITY_MAX = 0.9;
const OPACITY_DEFAULT = 0.5;

// Scale settings
const SCALE_OPTIONS = [0.5, 1] as const;
const ZOOM_FACTOR = 2;

// ============================================
// File Upload Settings
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

// ============================================
// UI Settings
// ============================================

const RESIZE_DEBOUNCE_MS = 100;

// ============================================
// Validation Limits
// ============================================

const GRID_COLUMNS_MIN = 1;
const GRID_COLUMNS_MAX = 100;

export {
  ALLOWED_MIME_TYPES,
  DEFAULT_GRID_OVERLAY_SETTINGS,
  DEFAULT_GRID_TEMPLATE,
  GRID_COLUMNS_MAX,
  GRID_COLUMNS_MIN,
  MAX_FILE_SIZE,
  MOCKUP_THUMBNAIL_SIZE,
  OPACITY_DEFAULT,
  OPACITY_MAX,
  OPACITY_MIN,
  OPACITY_STEP,
  RESIZE_DEBOUNCE_MS,
  SCALE_OPTIONS,
  ZOOM_FACTOR
};
