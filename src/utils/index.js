export const transformArrayOfStringsIntoLabelAndValueArray = (types) => {
  return types.map((item) => ({
    label: item,
    value: item,
  }));
};
