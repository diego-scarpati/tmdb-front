import axios from "axios";

export const removeTv = async (data) => {  
  const { type, id, tv } = data;
  try {
    const removedTvs = await axios.put(
      `https://tmdb-scarpati.herokuapp.com/api/tvs/removeTv?id=${id}&tv=${tv}`,
      data
    );
    return removedTvs;
  } catch (error) {
    console.log(error);
  }
};