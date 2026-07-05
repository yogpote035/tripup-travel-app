import { createSlice } from "@reduxjs/toolkit";

const initialTheme = (() => {
  try {
    const stored = localStorage.getItem("tripup_theme");
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch (e) {}
  return "light";
})();

const slice = createSlice({
  name: "theme",
  initialState: { mode: initialTheme },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      try {
        localStorage.setItem("tripup_theme", action.payload);
      } catch (e) {}
    },
    toggleTheme(state) {
      const next = state.mode === "dark" ? "light" : "dark";
      state.mode = next;
      try {
        localStorage.setItem("tripup_theme", next);
      } catch (e) {}
    },
  },
});

export const { setTheme, toggleTheme } = slice.actions;
export default slice.reducer;
