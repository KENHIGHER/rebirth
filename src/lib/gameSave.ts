import { useGameStore } from '../store/gameStore';

const SAVE_KEY = 'rebirth-main-save-v1';

const serializableState = () => JSON.parse(JSON.stringify(useGameStore.getState()));

export const hasGameSave = () => {
  try {
    return Boolean(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
};

export const hydrateGameSave = () => {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    useGameStore.setState(JSON.parse(raw));
    return true;
  } catch {
    return false;
  }
};

export const beginNewGame = () => {
  useGameStore.setState(useGameStore.getInitialState(), true);
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(serializableState()));
};

export const startGameAutosave = () =>
  useGameStore.subscribe(() => {
    if (!hasGameSave()) return;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(serializableState()));
    } catch {
      // A failed local save should never interrupt gameplay.
    }
  });
