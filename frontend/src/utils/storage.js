// src/utils/storage.js

const getStorageKey = (key) => {
  const port = window.location.port || '3000';
  return `${key}_${port}`;
};

export const setStorage = (key, value) => {
  const storageKey = getStorageKey(key);
  localStorage.setItem(storageKey, JSON.stringify(value));
};

export const getStorage = (key) => {
  const storageKey = getStorageKey(key);
  const item = localStorage.getItem(storageKey);
  return item ? JSON.parse(item) : null;
};

export const removeStorage = (key) => {
  const storageKey = getStorageKey(key);
  localStorage.removeItem(storageKey);
};

export const clearStorage = () => {
  const port = window.location.port || '3000';
  
  // Supprimer seulement les clés de ce port
  Object.keys(localStorage).forEach(key => {
    if (key.endsWith(`_${port}`)) {
      localStorage.removeItem(key);
    }
  });
};