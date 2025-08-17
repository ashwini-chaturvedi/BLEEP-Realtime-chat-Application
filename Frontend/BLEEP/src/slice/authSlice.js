import { createSlice } from "@reduxjs/toolkit";

// Helper functions for localStorage operations
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

const getTokenFromStorage = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (error) {
    console.error("Error getting token from localStorage:", error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      // Extract data from the correct payload structure
      const { dataFromLogin } = action.payload;
      
      // Assuming your backend returns { user: {...}, token: "..." }
      const userFromLogin = dataFromLogin?.user;
      const tokenFromLogin = dataFromLogin?.token;

      if (userFromLogin && tokenFromLogin) {
        state.user = userFromLogin;
        state.token = tokenFromLogin;
        state.error = null;

        // Store in localStorage
        try {
          localStorage.setItem("user", JSON.stringify(userFromLogin));
          localStorage.setItem("token", tokenFromLogin);
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }

        console.log("User logged in:", userFromLogin);
      } else {
        console.error("Invalid login data received:", dataFromLogin);
        state.error = "Invalid login response";
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;

      // Remove from localStorage
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    },
    
    // Additional reducers for better state management
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { login, logout, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;