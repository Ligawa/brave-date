import React from "react";
import { Link, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const SignupSuccess = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 3, backgroundColor: "#fff" }}>
      <Box sx={{ maxWidth: 480, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Check your email</Typography>
        <Typography sx={{ color: "#505965", lineHeight: 1.6, mb: 3 }}>
          Your Liebena account was created. {email ? `We sent a confirmation link to ${email}.` : "Open the confirmation email to activate your account."}
          If it does not arrive, check your spam folder or request another confirmation email from Supabase.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ borderRadius: 8, backgroundColor: "#d6002f" }}>
          Return to sign in
        </Button>
      </Box>
    </Box>
  );
};

export default SignupSuccess;
