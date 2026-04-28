export const routeGenerator = (items) => {
  return items.map((item) => ({
    path: item.path,
    element: item.element,
  }));
};