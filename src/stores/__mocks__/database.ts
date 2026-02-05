/**
 * Mock database module for testing stores
 */

import { vi } from "vitest";

export const getAllMockups = vi.fn().mockResolvedValue([]);
export const getMockup = vi.fn().mockResolvedValue(undefined);
export const addMockups = vi.fn().mockResolvedValue([]);
export const deleteMockup = vi.fn().mockResolvedValue(undefined);
export const resetMockups = vi.fn().mockResolvedValue(undefined);

export const getAllGrids = vi.fn().mockResolvedValue([]);
export const getGrid = vi.fn().mockResolvedValue(undefined);
export const addGrid = vi.fn().mockResolvedValue("mock-grid-id");
export const deleteGrid = vi.fn().mockResolvedValue(undefined);
export const resetGrids = vi.fn().mockResolvedValue(undefined);

export const getSettingsByGroup = vi.fn().mockResolvedValue({});
export const updateSetting = vi.fn().mockResolvedValue(undefined);
export const resetGridOverlaySettings = vi.fn().mockResolvedValue(undefined);

export function resetAllMocks() {
  getAllMockups.mockReset().mockResolvedValue([]);
  getMockup.mockReset().mockResolvedValue(undefined);
  addMockups.mockReset().mockResolvedValue([]);
  deleteMockup.mockReset().mockResolvedValue(undefined);
  resetMockups.mockReset().mockResolvedValue(undefined);

  getAllGrids.mockReset().mockResolvedValue([]);
  getGrid.mockReset().mockResolvedValue(undefined);
  addGrid.mockReset().mockResolvedValue("mock-grid-id");
  deleteGrid.mockReset().mockResolvedValue(undefined);
  resetGrids.mockReset().mockResolvedValue(undefined);

  getSettingsByGroup.mockReset().mockResolvedValue({});
  updateSetting.mockReset().mockResolvedValue(undefined);
  resetGridOverlaySettings.mockReset().mockResolvedValue(undefined);
}
