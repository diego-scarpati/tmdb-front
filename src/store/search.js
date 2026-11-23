import {
  createAction,
  createAsyncThunk,
  createReducer,
} from "@reduxjs/toolkit";
import getSearch from "../utils/getSearch";

export const deleteSearchData = createAction("DELETE_SEARCHED_TMDB");

export const setSearch = createAsyncThunk(
  "GET_SEARCHED_TMDB",
  async (data) => {
    const { searchValue } = data;
    try {
      const searchResult = await getSearch(searchValue);
      return searchResult;
    } catch (error) {
      console.log(error);
    }
  }
);

export const searchReducer = createReducer(
  { results: [{ name: "" }], page: 0 },
  {
    [deleteSearchData]: (state, action) => action.payload,

    [setSearch.fulfilled]: (state, action) => action.payload,
    [setSearch.rejected]: (state, action) =>
      console.log("GET_SEARCHED_TMDB rejected"),
  }
);
