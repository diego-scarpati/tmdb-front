import axios from "axios";

export const userTvs = async (id) => {
  try {
    const allUserTvs = await axios.get(
      `https://tmdb-scarpati.herokuapp.com/api/tvs/allUserTvs?id=${id}`
    );
    return allUserTvs.data
  } catch (error) {
    console.log(error);
  }
};