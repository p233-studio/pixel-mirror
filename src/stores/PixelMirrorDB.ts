function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  return "image/jpeg";
}

const defaultGridSet: Omit<GridSet, "createdAt"> = {
  id: "default",
  width: "1140px",
  columns: 12,
  gutterWidth: "24px",
  isGutterOnOutside: true,
  position: "center"
};

export default class PixelMirrorDB {
  private static readonly DB_NAME = "PixelMirrorDB";
  private static readonly DESIGN_STORE_NAME = "designs";
  private static readonly GRID_STORE_NAME = "grids";
  private static readonly VERSION = 1;
  private static db: IDBDatabase | undefined = undefined;

  private constructor() {}

  static async init(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.DESIGN_STORE_NAME)) {
          db.createObjectStore(this.DESIGN_STORE_NAME, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(this.GRID_STORE_NAME)) {
          const gridStore = db.createObjectStore(this.GRID_STORE_NAME, { keyPath: "id" });
          gridStore.add({ ...defaultGridSet, createdAt: Date.now() });
        }
      };
    });
  }

  static async uploadDesign(files: File[]): Promise<Design[]> {
    const itemPromises = files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      return {
        id: crypto.randomUUID(),
        buffer,
        mimeType: getMimeType(file.name),
        createdAt: Date.now()
      };
    });

    const Designs = await Promise.all(itemPromises);

    const transaction = this.db!.transaction(this.DESIGN_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.DESIGN_STORE_NAME);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error as Error);
      }),
      ...Designs.map(
        (item) =>
          new Promise<void>((resolve, reject) => {
            const request = store.add(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error as Error);
          })
      )
    ]);

    return Designs.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async getDesign(id: string): Promise<Design | undefined> {
    const store = this.db!.transaction(this.DESIGN_STORE_NAME, "readonly").objectStore(this.DESIGN_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve(request.result as Design | undefined);
    });
  }

  static async getAllDesigns(): Promise<Design[]> {
    const store = this.db!.transaction(this.DESIGN_STORE_NAME, "readonly").objectStore(this.DESIGN_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve((request.result as Design[]).sort((a, b) => b.createdAt - a.createdAt));
    });
  }

  static async deleteDesign(id: string): Promise<void> {
    const transaction = this.db!.transaction(this.DESIGN_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.DESIGN_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }

  static async deleteAllDesigns(): Promise<void> {
    const transaction = this.db!.transaction(this.DESIGN_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.DESIGN_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }

  static async addGridSet(grid: Omit<GridSet, "id" | "createdAt">): Promise<GridSet> {
    const gridSet = { ...grid, id: crypto.randomUUID(), createdAt: Date.now() };
    const transaction = this.db!.transaction(this.GRID_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.GRID_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.add(gridSet);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });

    return gridSet;
  }

  static async getGridSet(id: string): Promise<GridSet | undefined> {
    const store = this.db!.transaction(this.GRID_STORE_NAME, "readonly").objectStore(this.GRID_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve(request.result as GridSet | undefined);
    });
  }

  static async getAllGridSets(): Promise<GridSet[]> {
    const store = this.db!.transaction(this.GRID_STORE_NAME, "readonly").objectStore(this.GRID_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve((request.result as GridSet[]).sort((a, b) => a.createdAt - b.createdAt));
    });
  }

  static async deleteGridSet(id: string): Promise<void> {
    const transaction = this.db!.transaction(this.GRID_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.GRID_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }

  static async resetGridSets(): Promise<GridSet[]> {
    const transaction = this.db!.transaction(this.GRID_STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.GRID_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });

    const defaultValue = { ...defaultGridSet, createdAt: Date.now() };
    await new Promise<void>((resolve, reject) => {
      const request = store.add(defaultValue);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });

    return [defaultValue];
  }
}
