import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useDispatch } from "react-redux";
import SearchBar from "./commons/SearchBar";
import Header from "./components/Header";
import Display from "./components/Display";
import NotFound from "./commons/NotFound";
import Overview from "./components/Overview";
import getMovies from "./utils/getMovies";
import getTv from "./utils/getTv";
import { Box } from "@chakra-ui/react";
import { setGeoInfo } from "./store/geoInfo";
import "./index.css";

const App = () => {
  const [movieList, setMovieList] = useState([]);
  const [tvList, setTvList] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();

  useEffect(() => {
    const getData = async () => {
      const movies = await getMovies();
      const tv = await getTv();
      setMovieList(movies?.results ?? []);
      setTvList(tv?.results ?? []);
      dispatch(setGeoInfo());
    };
    getData();
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <React.StrictMode>
      <Box minH="700px" id="body">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SearchBar />
                <Display movieList={movieList} tvList={tvList} />
              </>
            }
          />
          <Route
            path="search/:type"
            element={
              <>
                <SearchBar />
                <Display movieList={movieList} tvList={tvList} />
              </>
            }
          />
          <Route
            path="search/:type/:id/*"
            element={<Overview isMobile={isMobile} />}
          />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="404" />} />
        </Routes>
      </Box>
    </React.StrictMode>
  );
};

export default App;
