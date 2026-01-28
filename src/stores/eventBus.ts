/**
 * Event Bus for Store Synchronization
 */

type Callback<G extends SettingGroup> = (settings: Partial<AppSettings[G]>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscribers = new Map<SettingGroup, Set<Callback<any>>>();

export const settingsEventBus = {
  emit<G extends SettingGroup>(group: G, settings: Partial<AppSettings[G]>) {
    subscribers.get(group)?.forEach((cb) => {
      try {
        cb(settings);
      } catch (e) {
        console.error("[EventBus]", e);
      }
    });
  },

  on<G extends SettingGroup>(group: G, callback: Callback<G>) {
    if (!subscribers.has(group)) {
      subscribers.set(group, new Set());
    }
    subscribers.get(group)!.add(callback);
    return () => subscribers.get(group)?.delete(callback);
  }
};
