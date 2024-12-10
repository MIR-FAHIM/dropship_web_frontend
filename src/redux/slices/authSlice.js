import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const { token } = action.payload;
      state.token = token;
    },
    logout: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, logout } = authSlice.actions;

export default authSlice.reducer;

export const useCurrentToken = (state) => state.auth.token;
