function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  return "image/jpeg";
}

export default class DesignDB {
  private static readonly DB_NAME = "JigsawDB";
  private static readonly STORE_NAME = "designs";
  private static readonly VERSION = 1;
  private static db: IDBDatabase | undefined = undefined;

  private constructor() {}

  private static async init(): Promise<void> {
    if (this.db) return;

    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  static async upload(files: File[]): Promise<Design[]> {
    if (!this.db) await this.init();

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

    const transaction = this.db!.transaction(this.STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.STORE_NAME);

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

  static async delete(ids: string[]): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(this.STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.STORE_NAME);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error as Error);
      }),
      ...ids.map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error as Error);
          })
      )
    ]);
  }

  static async getDesign(id: string): Promise<Design | undefined> {
    if (!this.db) await this.init();

    const store = this.db!.transaction(this.STORE_NAME, "readonly").objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve(request.result as Design | undefined);
    });
  }

  static async getAllDesigns(): Promise<Design[]> {
    if (!this.db) await this.init();

    const store = this.db!.transaction(this.STORE_NAME, "readonly").objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error as Error);
      request.onsuccess = () => resolve((request.result as Design[]).sort((a, b) => b.createdAt - a.createdAt));
    });
  }
}
