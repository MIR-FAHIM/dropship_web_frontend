import { createSlice } from "@reduxjs/toolkit";
import {
  getFromLocalstorage,
  saveToLocalstorage,
  removeFromLocalstorage,
} from "../../utils/localstorage.utils";

const storedToken = getFromLocalstorage("token");
const storedUserId = getFromLocalstorage("userId");
const storedUser = getFromLocalstorage("user");

const initialState = {
  token: storedToken || null,
  userId: storedUserId || null,
  user: storedUser || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const payload = action.payload || {};
      const token = payload.token !== undefined ? payload.token : null;
      const user = payload.user || null;
      const userId = payload.userId || user?.id || null;

      state.token = token;
      if (user !== null) state.user = user;
      if (userId !== null) state.userId = userId;

      if (token) {
        saveToLocalstorage("token", token);
      } else {
        removeFromLocalstorage("token");
      }
      if (userId) {
        saveToLocalstorage("userId", userId);
      }
      if (user) {
        saveToLocalstorage("user", user);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.userId = null;
      removeFromLocalstorage("token");
      removeFromLocalstorage("userId");
      removeFromLocalstorage("user");
    },
  },
});

export const { setToken, logout } = authSlice.actions;

export default authSlice.reducer;

export const useCurrentToken = (state) => state.auth.token;
export const useCurrentUser = (state) => state.auth.user;
export const useCurrentUserId = (state) => state.auth.userId;
