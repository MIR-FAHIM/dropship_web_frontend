export const saveToLocalstorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

export const getFromLocalstorage = (name) => {
  return JSON.parse(localStorage.getItem(name));
};

export const removeFromLocalstorage = (name) => {
  localStorage.removeItem(name);
};
