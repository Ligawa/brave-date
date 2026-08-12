import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import SwipeIcon from "@mui/icons-material/Style";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PersonIcon from "@mui/icons-material/Person";

const items = [
  ["swipe", "Swipe", SwipeIcon],
  ["explore", "Explore", ExploreIcon],
  ["likes", "Likes", FavoriteIcon],
  ["chat", "Chat", ChatBubbleIcon],
  ["profile", "Profile", PersonIcon],
];

export default function MobileBottomNav({ value, onChange }) {
  return (
    <Box className="mobile-bottom-nav" component="nav" aria-label="Primary navigation">
      {items.map(([key, label, Icon]) => (
        <IconButton key={key} aria-label={label} onClick={() => onChange(key)} className={value === key ? "is-active" : ""}>
          <Icon />
          <span>{label}</span>
        </IconButton>
      ))}
    </Box>
  );
}
