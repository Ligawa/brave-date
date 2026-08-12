import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const groups = [
  ["Short-term relationship", "People open to something light and intentional."],
  ["Friendship", "Meet people looking for meaningful connection."],
  ["Long-term relationship", "Discover people seeking commitment."],
  ["Double Date", "Find social plans and couples-friendly connections."],
  ["Astrology", "Connect through signs and shared cosmic interests."],
  ["Music", "Meet people who share your sound."],
];

export default function ExplorePanel({ onCategory }) {
  return (
    <Box className="explore-panel">
      <Typography variant="h5" fontWeight={700}>Explore your kind of connection</Typography>
      <Typography variant="body2" color="text.secondary">Browse people by shared relationship goals and interests.</Typography>
      <Box className="explore-groups">
        {groups.map(([label, description]) => (
          <Box key={label} className="explore-group" onClick={() => onCategory(label)} role="button" tabIndex={0}>
            <Typography fontWeight={700}>{label}</Typography>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
            <Chip size="small" label="Browse" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
