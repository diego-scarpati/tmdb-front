import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import Card from "../commons/Card";
import { Box, Link, Text } from "@chakra-ui/react";

const Display = ({ movieList = [], tvList = [] }) => {
  const search = useSelector((state) => state.search);
  const { type } = useParams();

  if (search?.page > 0) {
    const results = (search.results || []).filter((item) => {
      const isMovieOrTv =
        item.media_type === "movie" || item.media_type === "tv";
      return isMovieOrTv && (!type || type === item.media_type);
    });

    return (
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-evenly"
        mx="50px"
        mb="20px"
      >
        {results.length > 0 ? (
          results.map((item) => (
            <Box
              key={`${item.media_type}-${item.id}`}
              _hover={{ transform: "scale(1.05)" }}
            >
              <Link
                as={RouterLink}
                to={`/search/${item.media_type}/${item.id}`}
              >
                <Card {...item} />
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
          <Link as={RouterLink} to={`/search/${listType}/${item.id}`}>
            <Card {...item} media_type={listType} />
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export default Display;
