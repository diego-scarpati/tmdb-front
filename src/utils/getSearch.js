import axios from "axios";

const apiKey = "6edac15cca9bd35488d662783103bd8f";
const path = "https://api.themoviedb.org/3/search/multi";
const getSearch = async (searchValue) => {
  try {
    const axiosSearch = await axios.get(path, {
      params: {
        api_key: apiKey,
        query: searchValue,
        include_adult: false,
        language: "en-US",
      },
    });
    return axiosSearch.data;
  } catch (error) {
    console.log("axios error", error);
  }
};

export default getSearch;
