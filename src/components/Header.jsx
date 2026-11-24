import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import popcorn from "../assets/popcorn32.png";
import { deleteSearchData } from "../store/search";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navigateToType = (type) => {
    dispatch(deleteSearchData({ results: [{ name: "" }], page: 0 }));
    navigate(`/search/${type}`);
  };

  const navigationItems = (
    <>
      <MenuItem onClick={() => navigateToType("movie")}>Movies</MenuItem>
      <MenuItem onClick={() => navigateToType("tv")}>TV Shows</MenuItem>
    </>
  );

  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      px={{ base: "10px", md: "20px", lg: "30px" }}
      boxShadow="lg"
      w="100%"
      h="70px"
      color="#fdf0d5"
      bgGradient="linear(to-b, #c1121f, #780000)"
    >
      <Link
        as={RouterLink}
        to="/"
        display="flex"
        alignItems="center"
        flexShrink={0}
        color="inherit"
        _hover={{ textDecoration: "none" }}
      >
        <Image src={popcorn} alt="" objectFit="cover" />
        <Heading fontSize="26px" pl="10px">
          TMDB
        </Heading>
      </Link>

      <Box display={{ base: "none", md: "flex" }} gap={2}>
        <Button variant="ghost" color="inherit" onClick={() => navigateToType("movie")}>
          Movies
        </Button>
        <Button variant="ghost" color="inherit" onClick={() => navigateToType("tv")}>
          TV Shows
        </Button>
      </Box>

      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Open navigation"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="inherit"
          display={{ base: "inline-flex", md: "none" }}
        />
        <MenuList bgGradient="linear(to-b, #c1121f, #780000)" border="none">
          {navigationItems}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Header;
