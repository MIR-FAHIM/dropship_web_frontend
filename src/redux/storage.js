import { configureStore } from "@reduxjs/toolkit";

import Logger from "./middlewares/logger";
import baseApi from "./api/baseApi";

const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, Logger),
});

export default store;
