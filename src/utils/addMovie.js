import axios from "axios";

export const addMovie = async (data) => {
  try {
    const addedMovie = await axios.post(
      "https://tmdb-scarpati.herokuapp.com/api/movies/addMovie",
      data
    );
    return addedMovie;
  } catch (error) {
    console.log(error);
  }
};
