import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SidebarHeader from "../../components/SideBar/SidebarHeader";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import MatchesList from "../../components/SideBar/MatchesList";
import MessagesList from "../../components/SideBar/MessagesList";
import LikesList from "../../components/LikesList";
import MainContainer from "../../components/MainContainer";
import { currentUser } from "../../redux/authReducer/selectors";
import { chatList } from "../../redux/chatReducer/selectors";
import { onUserSelect } from "../../redux/chatReducer/actions";
import { matches } from "../../redux/matchReducer/selectors";
import { useDispatch, useSelector } from "react-redux";
import { getUserMatches, updateLocation, setInitialUsers } from "../../api/MatchAPI";
import { getMessagesList } from "../../api/ChatAPI";
import MobileBottomNav from "../../components/MobileBottomNav";
import ExplorePanel from "../../components/ExplorePanel";
import ProfileDetail from "../../components/SideBar/ProfileDetail";
import BoostPanel from "../../components/BoostPanel";
import BoltIcon from "@mui/icons-material/Bolt";

const Sidebar = () => {
  const thisCurrentUser = useSelector(currentUser);
  const currentMessages = useSelector(chatList);
  const currentMatches = useSelector(matches);
  const [value, setValue] = useState(1);
  const [mobileSection, setMobileSection] = useState("swipe");
  const [boostOpen, setBoostOpen] = useState(false);
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const onMatchUserSelect = (user) => {
    dispatch(onUserSelect(user));
  };
  useEffect(() => {
    if (!navigator.geolocation) return undefined;
    const watchId = navigator.geolocation.watchPosition(({ coords }) => {
      dispatch(updateLocation(coords.latitude, coords.longitude));
    }, undefined, { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  useEffect(() => {
    if (value === 1) {
      dispatch(getUserMatches());
    }
    if (value === 2) {
      dispatch(getMessagesList());
    }
  }, [value, dispatch]);
  const handleMobileSection = (next) => {
    setMobileSection(next);
    if (next === "likes") setValue(0);
    if (next === "chat") setValue(2);
    if (next === "swipe") setValue(1);
  };

  return (
    <Box className="in-build-app-container">
      <Box className="in-build-app-sidebar">
        <SidebarHeader user={thisCurrentUser} />
        <Tabs
          className="tab-container"
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#ec4764",
              marginLeft: "5px",
              marginBottom: "8px",
            },
          }}
        >
          <Tab label="Likes" value={0} sx={{ textTransform: "none", fontSize: 16, fontWeight: "bold" }} />
          <Tab
            style={{
              textTransform: "none",
              fontSize: 16,
              fontWeight: "bold",
              color: value === 1 ? "#000" : "",
            }}
            label="Matches"
            value={1}
          />
          <Tab
            style={{
              textTransform: "none",
              fontSize: 16,
              fontWeight: "bold",
              color: value === 2 ? "#000" : "",
            }}
            label="Messages"
            value={2}
          />
        </Tabs>
        {value === 0 ? <LikesList onMatchesSelect={onMatchUserSelect} /> : value === 1 ? (
          <MatchesList currentUser={thisCurrentUser} matches={currentMatches} onMatchesSelect={onMatchUserSelect} />
        ) : (
          <MessagesList messages={currentMessages} onMessagesSelect={onMatchUserSelect} />
        )}
      </Box>
      <Box className="mobile-discovery-header">
        <Typography variant="subtitle1" fontWeight={700}>For you</Typography>
        <Box className="mobile-discovery-actions">
          {['Double Date', 'Astrology', 'Music'].map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => { setCategory(item); dispatch(setInitialUsers({ category: item })); }}>{item}</button>)}
          <button className="boost-trigger" aria-label="Boost profile" onClick={() => setBoostOpen(true)}><BoltIcon /></button>
        </Box>
      </Box>
      {mobileSection === "explore" ? <ExplorePanel onCategory={setCategory} /> : mobileSection === "profile" ? <ProfileDetail currentUser="true" user={thisCurrentUser} /> : <MainContainer />}
      {boostOpen && <Box className="boost-overlay"><BoostPanel onClose={() => setBoostOpen(false)} /></Box>}
      <MobileBottomNav value={mobileSection} onChange={handleMobileSection} />
    </Box>
  );
};

export default Sidebar;
