import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../utils/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    
  },
});
