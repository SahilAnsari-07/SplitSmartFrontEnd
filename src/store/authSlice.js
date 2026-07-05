import { createSlice } from "@reduxjs/toolkit";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getUserFromToken(token) {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  return {
    id: payload.userId || payload.id || payload.sub,
    name: payload.name || payload.fullName || "",
    email: payload.email || payload.sub || "",
  };
}

/**
 * Normalize user data to always have `id` field (not `userId`).
 * The backend sends `userId` in the response, but the JWT also
 * has `userId` claim which we parse as `id`. This normalizer
 * ensures consistency.
 */
function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id || user.userId,
    name: user.name || "",
    email: user.email || "",
  };
}

function getInitialAuthState() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  return {
    status: Boolean(token),
    token: token || null,
    userData: storedUser
      ? normalizeUser(JSON.parse(storedUser))
      : getUserFromToken(token),
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.status = Boolean(token);
      state.token = token;
      state.userData = normalizeUser(user) || getUserFromToken(token);

      if (token) {
        localStorage.setItem("token", token);
      }
      if (state.userData) {
        localStorage.setItem("user", JSON.stringify(state.userData));
      }
    },
    logout: (state) => {
      state.status = false;
      state.token = null;
      state.userData = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
