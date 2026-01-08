import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { DEFAULT_APP_SETTINGS } from "../constants";

const DB_NAME = "PixelMirrorDB";
const VERSION = 2;

interface PixelMirrorDBSchema extends DBSchema {
  mockups: {
    key: Mockup["id"];
    value: Omit<Mockup, "originalBuffer">;
  };
  mockup_blobs: {
    key: Mockup["id"];
    value: ArrayBuffer;
  };
  grids: {
    key: GridConfig["id"];
    value: GridConfig;
  };
  settings: {
    key: SettingGroup;
    value: AppSettings[SettingGroup];
  };
}

// Initialize Database

let dbPromise: Promise<IDBPDatabase<PixelMirrorDBSchema>>;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PixelMirrorDBSchema>(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("mockups")) {
          db.createObjectStore("mockups", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("mockup_blobs")) {
          db.createObjectStore("mockup_blobs");
        }

        if (!db.objectStoreNames.contains("grids")) {
          db.createObjectStore("grids", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      }
    });
  }
  return dbPromise;
}

// Mockup Operations

type MockupInput = Omit<Mockup, "id" | "createdAt">;

export async function getAllMockups(): Promise<Omit<Mockup, "originalBuffer">[]> {
  const db = await getDB();
  const mockups = await db.getAll("mockups");
  return mockups.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getMockup(id: string): Promise<Mockup | undefined> {
  const db = await getDB();
  const tx = db.transaction(["mockups", "mockup_blobs"], "readonly");
  const [metadata, originalBuffer] = await Promise.all([
    tx.objectStore("mockups").get(id),
    tx.objectStore("mockup_blobs").get(id),
    tx.done
  ]);

  if (!metadata || !originalBuffer) return undefined;
  return { ...metadata, originalBuffer };
}

export async function addMockups(input: MockupInput | MockupInput[]): Promise<string[]> {
  const inputs = Array.isArray(input) ? input : [input];
  const db = await getDB();
  const tx = db.transaction(["mockups", "mockup_blobs"], "readwrite");
  const metadataStore = tx.objectStore("mockups");
  const blobStore = tx.objectStore("mockup_blobs");

  const mockups: Mockup[] = inputs.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now()
  }));

  const putPromises = mockups.map((m) => {
    const { originalBuffer, ...rest } = m;
    return Promise.all([metadataStore.put(rest), blobStore.put(originalBuffer, m.id)]);
  });

  await Promise.all([...putPromises, tx.done]);

  return mockups.map((m) => m.id);
}

export async function deleteMockup(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["mockups", "mockup_blobs"], "readwrite");
  await Promise.all([tx.objectStore("mockups").delete(id), tx.objectStore("mockup_blobs").delete(id), tx.done]);
}

export async function resetMockups(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["mockups", "mockup_blobs"], "readwrite");
  await Promise.all([tx.objectStore("mockups").clear(), tx.objectStore("mockup_blobs").clear(), tx.done]);
}

// Grid Operations

type GridInput = Omit<GridConfig, "id" | "createdAt">;

export async function getAllGrids(): Promise<GridConfig[]> {
  const db = await getDB();
  const grids = await db.getAll("grids");
  return grids.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addGrid(input: GridInput): Promise<string> {
  const db = await getDB();
  const grid: GridConfig = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now()
  };
  await db.put("grids", grid);
  return grid.id;
}

export async function deleteGrid(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("grids", id);
}

export async function resetGrids(): Promise<void> {
  const db = await getDB();
  await db.clear("grids");
}

// Settings Operations

export async function getSettingsByGroup<G extends SettingGroup>(group: G): Promise<AppSettings[G]> {
  const db = await getDB();
  const settings = (await db.get("settings", group)) as AppSettings[G] | undefined;
  return { ...DEFAULT_APP_SETTINGS[group], ...settings };
}

export async function updateSettingsGroup<G extends SettingGroup>(group: G, settings: AppSettings[G]): Promise<void> {
  const db = await getDB();
  await db.put("settings", settings, group);
}

export async function updateSetting<G extends SettingGroup, K extends keyof AppSettings[G]>(
  group: G,
  key: K,
  value: AppSettings[G][K]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("settings", "readwrite");
  const store = tx.objectStore("settings");

  const existingSettings = ((await store.get(group)) || {}) as AppSettings[G];
  const currentSettings = { ...DEFAULT_APP_SETTINGS[group], ...existingSettings };
  currentSettings[key] = value;

  await store.put(currentSettings, group);
  await tx.done;
}

export async function resetSettings(): Promise<void> {
  const db = await getDB();
  await db.clear("settings");
}
