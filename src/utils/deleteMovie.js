import axios from "axios";

export const removeMovie = async (data) => {
  const { type, id, movie } = data;
  try {
    const removedMovies = await axios.put(
      `https://tmdb-scarpati.herokuapp.com/api/movies/removeMovie?id=${id}&movie=${movie}`,
      data
    );
    return removedMovies;
  } catch (error) {
    console.log(error);
  }
};
