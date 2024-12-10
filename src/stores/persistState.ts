import { createStore } from "solid-js/store";

const localStorageKeyPrefix = "_J-";

const defaultPersistState = {
  designId: undefined,
  desginOpacity: 0.5,
  designPosition: { x: 0, y: 0 },
  designScale: 1,
  isDesignLocked: false,
  isDesignVisible: true,
  isGridGuideVisible: false
} satisfies PersistState;

function getLocalStorageItem<K extends keyof PersistState>(key: K): PersistState[K] {
  const value = localStorage.getItem(localStorageKeyPrefix + key);
  return value ? (JSON.parse(value) as PersistState[K]) : defaultPersistState[key];
}

const initPersistState = Object.keys(defaultPersistState).reduce(
  (acc, key) => ({
    ...acc,
    [key]: getLocalStorageItem(key as keyof PersistState)
  }),
  {} as PersistState
);

const [persistState, setPersistState] = createStore<PersistState>(initPersistState);

function updatePersistState(updates: Partial<PersistState>) {
  Object.entries(updates).forEach(([key, value]) => {
    localStorage.setItem(localStorageKeyPrefix + key, JSON.stringify(value));
  });
  setPersistState((prev) => ({ ...prev, ...updates }));
}

function resetPersistState() {
  Object.entries(defaultPersistState).forEach(([key, value]) => {
    localStorage.setItem(localStorageKeyPrefix + key, JSON.stringify(value));
  });
  setPersistState(defaultPersistState);
}

export { persistState, updatePersistState, resetPersistState };
