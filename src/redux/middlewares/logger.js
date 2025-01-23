const Logger = (state) => (next) => (action) => {
  // console.log("current-state:", state.getState());
  next(action);
  // console.log("next-state:", state.getState());
};
export default Logger;
