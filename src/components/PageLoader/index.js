import React from "react";
import Box from "@mui/material/Box";
const PageLoader = () => {
  return (
    <Box className="page-loader">
      <Box component="img" src="/liebena-logo.png" alt="Liebena" className="liebena-loader-logo" />
    </Box>
  );
};

export default PageLoader;
