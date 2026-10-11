export const saveToLocalstorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

export const getFromLocalstorage = (name) => {
  try {
    const item = localStorage.getItem(name);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return localStorage.getItem(name);
  }
};

export const removeFromLocalstorage = (name) => {
  localStorage.removeItem(name);
};
