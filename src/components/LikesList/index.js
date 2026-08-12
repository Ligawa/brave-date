import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { getReceivedLikes, respondToLike } from "../../api/LikesAPI";

const LikesList = ({ onMatchesSelect }) => {
  const [likes, setLikes] = useState([]);
  const dispatch = useDispatch();
  const load = useCallback(() => dispatch(getReceivedLikes(setLikes)), [dispatch]);
  useEffect(() => { load(); }, [load]);
  return <Box className="likes-list" sx={{ overflowY: "auto", flex: 1, p: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>People who like you</Typography>
    {!likes.length && <Typography color="text.secondary">No new likes yet. Keep exploring.</Typography>}
    {likes.map((user) => <Box key={user.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, mb: 1, borderRadius: 2, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>
      <img src={user.profile_picture || "/images/avatar-placeholder.png"} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
      <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={700} noWrap>{user.first_name}</Typography><Typography variant="body2" color="text.secondary" noWrap>{user.passion || "Sent you a like"}</Typography></Box>
      <Button size="small" variant="contained" onClick={() => dispatch(respondToLike(user, "like", (result) => { setLikes((items) => items.filter((item) => item.id !== user.id)); if (result.matched) onMatchesSelect(user); }))}>Like back</Button>
      <Button size="small" color="inherit" onClick={() => dispatch(respondToLike(user, "pass", () => setLikes((items) => items.filter((item) => item.id !== user.id))))}>Pass</Button>
    </Box>)}
  </Box>;
};
export default LikesList;
