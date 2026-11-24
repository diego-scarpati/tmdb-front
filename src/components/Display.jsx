import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Card from "../commons/Card";
import { Box, Link, Text } from "@chakra-ui/react";

const resolveMediaType = (item, fallbackType) => {
  if (item?.media_type === "movie" || item?.media_type === "tv") {
    return item.media_type;
  }

  if (fallbackType === "movie" || fallbackType === "tv") {
    return fallbackType;
  }

  if (item?.name && !item?.title) return "tv";
  if (item?.title && !item?.name) return "movie";

  return null;
};

const Display = ({ movieList = [], tvList = [] }) => {
  const search = useSelector((state) => state.search);
  const { type } = useParams();
  const location = useLocation();
  const returnTo =
    location.pathname === "/" ||
    location.pathname === "/search/movie" ||
    location.pathname === "/search/tv"
      ? location.pathname
      : "/";

  if (search?.page > 0) {
    const routeType = type === "movie" || type === "tv" ? type : undefined;
    const results = (search.results || [])
      .map((item) => ({ item, mediaType: resolveMediaType(item, routeType) }))
      .filter(
        ({ item, mediaType }) =>
          mediaType && item?.id != null && (!routeType || routeType === mediaType)
      );

    return (
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-evenly"
        mx="50px"
        mb="20px"
      >
        {results.length > 0 ? (
          results.map(({ item, mediaType }) => (
            <Box
              key={`${mediaType}-${item.id}`}
              _hover={{ transform: "scale(1.05)" }}
            >
              <Link
                as={RouterLink}
                to={`/search/${mediaType}/${item.id}`}
                state={{ returnTo }}
              >
                <Card {...item} media_type={mediaType} />
              </Link>
            </Box>
          ))
        ) : (
          <Text>No movie or TV results found.</Text>
        )}
      </Box>
    );
  }

  const listType = type === "tv" ? "tv" : "movie";
  const items = listType === "tv" ? tvList : movieList;

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="space-evenly"
      mx="50px"
      mb="20px"
    >
      {items.map((item) => (
        <Box
          key={`${listType}-${item.id}`}
          _hover={{ transform: "scale(1.05)" }}
        >
          <Link
            as={RouterLink}
            to={`/search/${listType}/${item.id}`}
            state={{ returnTo }}
          >
            <Card {...item} media_type={listType} />
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export default Display;
