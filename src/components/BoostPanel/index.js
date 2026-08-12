import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import axios from "axios";
import { Server } from "../../utils";

export default function BoostPanel({ onClose }) {
  const [endsAt, setEndsAt] = useState(() => Number(sessionStorage.getItem("liebena_boost_ends") || 0));
  const [remaining, setRemaining] = useState(Math.max(0, endsAt - Date.now()));
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, endsAt - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);
  const activate = async () => {
    const token = localStorage.getItem("token");
    const { data } = await axios.post(`${Server.endpoint}/user/boost`, {}, { headers: { Authorization: `Bearer ${token}` } });
    const next = new Date(data.boost_until).getTime();
    sessionStorage.setItem("liebena_boost_ends", String(next));
    setEndsAt(next);
  };
  const minutes = Math.floor(remaining / 60000);
  return (
    <Box className="boost-panel">
      <BoltIcon sx={{ color: "#d6002f", fontSize: 34 }} />
      <Typography variant="h6" fontWeight={700}>Boost your profile</Typography>
      <Typography variant="body2" color="text.secondary">Appear higher in discovery for 30 minutes so more people can find you.</Typography>
      {remaining > 0 ? <Typography color="primary" fontWeight={700}>Boost active · {minutes} min left</Typography> : <Button variant="contained" startIcon={<BoltIcon />} onClick={activate}>Activate free boost</Button>}
      <Button onClick={onClose}>Not now</Button>
    </Box>
  );
}
