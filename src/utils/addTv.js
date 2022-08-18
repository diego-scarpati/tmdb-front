import axios from "axios";

export const addTv = async (data) => {
  try {
    const addedTv = await axios.post(
      "https://tmdb-scarpati.herokuapp.com/api/tvs/addTv",
      data
    );
    return addedTv;
  } catch (error) {
    console.log(error);
  }
};