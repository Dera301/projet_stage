// src/utils/storage.js

// Générer un ID unique pour cet onglet s'il n'existe pas
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

const getStorageKey = (key) => {
  const { hostname } = window.location;
  const tabId = getTabId();
  return `${key}_${hostname}_${tabId}`;
};

export const setStorage = (key, value) => {
  const storageKey = getStorageKey(key);
  sessionStorage.setItem(storageKey, JSON.stringify(value));
};

export const getStorage = (key) => {
  const storageKey = getStorageKey(key);
  const item = sessionStorage.getItem(storageKey);
  return item ? JSON.parse(item) : null;
};

export const removeStorage = (key) => {
  const storageKey = getStorageKey(key);
  sessionStorage.removeItem(storageKey);
};

export const clearStorage = () => {
  const tabId = getTabId();
  // Supprimer seulement les clés de cet onglet
  Object.keys(sessionStorage).forEach(key => {
    if (key.endsWith(tabId)) {
      sessionStorage.removeItem(key);
    }
  });
  // Supprimer également l'ID de l'onglet
  sessionStorage.removeItem('tabId');
};