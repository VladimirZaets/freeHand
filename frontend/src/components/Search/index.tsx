import styles from "./index.module.css";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import * as React from "react";
import {styled} from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Search = () => {
  return (
    <Box
      component={'div'}
      sx={{ width: { sm: "auto" }, mx: 1 }}
      className={styles['search-container']}
    >
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
      />
    </Box>
  )
};

export default Search;