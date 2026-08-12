import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const groups = [
  ["Short-term relationship", "People open to something light and intentional.", "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80"],
  ["Friendship", "Meet people looking for meaningful connection.", "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"],
  ["Long-term relationship", "Discover people seeking commitment.", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"],
  ["Double Date", "Find social plans and couples-friendly connections.", "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80"],
  ["Astrology", "Connect through signs and shared cosmic interests.", "https://images.unsplash.com/photo-1534791547706-9d7a8e4f4b7f?auto=format&fit=crop&w=900&q=80"],
  ["Music", "Meet people who share your sound.", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80"],
];

export default function ExplorePanel({ onCategory }) {
  return (
    <Box className="explore-panel">
      <Typography variant="h5" fontWeight={700}>Explore your kind of connection</Typography>
      <Typography variant="body2" color="text.secondary">Browse people by shared relationship goals and interests.</Typography>
      <Box className="explore-groups">
        {groups.map(([label, description, image]) => (
          <Box key={label} className="explore-group" onClick={() => onCategory(label)} role="button" tabIndex={0}>
            <img src={image} alt="" className="explore-group-image" />
            <Box className="explore-group-content">
              <Typography fontWeight={800}>{label}</Typography>
              <Typography variant="body2" color="text.secondary">{description}</Typography>
              <Chip size="small" label="Browse people" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
