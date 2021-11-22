import { createStore, action } from "easy-peasy";

export default createStore({
  isLoggedIn: false,
  setIsLoggedIn: action((state, payload) => {
    state.isLoggedIn = payload;
  }),

  session: null,
  setSession: action((state, payload) => {
    state.session = payload;
  }),

  isFooterVisible: true,
  setIsFooterVisible: action((state, payload) => {
    state.isFooterVisible = payload;
  }),

  user: null,
  setUser: action((state, payload) => {
    state.user = payload;
  }),
});
