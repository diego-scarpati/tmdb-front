import { configureStore } from "@reduxjs/toolkit";
import { selectedReducer } from "./selected";
import { geoInfoReducer } from "./geoInfo";
import { providersReducer } from "./providers";
import { searchReducer } from "./search";

const store = configureStore({
  reducer: {
    selected: selectedReducer,
    geoInfo: geoInfoReducer,
    providers: providersReducer,
    search: searchReducer,
  },
});

export default store;
