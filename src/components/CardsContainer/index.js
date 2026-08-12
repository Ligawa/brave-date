import React, { useState, useMemo, useRef } from "react";
import { Box, Button, MenuItem, Select, Slider, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import TinderCard from "react-tinder-card";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BoltIcon from "@mui/icons-material/Bolt";
import { users } from "../../redux/matchReducer/selectors";
import { useDispatch, useSelector } from "react-redux";
import { setInitialUsers, setSelectedMatch } from "../../api/MatchAPI";
import moment from "moment";

const CardsContainer = () => {
  const dispatch = useDispatch();
  const db = useSelector(users);
  const [currentIndex, setCurrentIndex] = useState(db.length - 1);
  const [, setLastDirection] = useState();
  const [currentDirection, setCurrentDirection] = useState();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ min_age: 18, max_age: 80, distance: 50, gender: "any" });
  const applyFilters = () => {
    dispatch(setInitialUsers(filters));
    setFiltersOpen(false);
  };
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    [db.length]
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < db.length - 1;

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = async (direction, email, index) => {
    setLastDirection(direction);
    setCurrentDirection(direction);
    updateCurrentIndex(index - 1);
    setTimeout(() => {
      setCurrentDirection("");
      if (direction === "right") {
        dispatch(setSelectedMatch(db[index], "like"));
      } else if (direction === "left") {
        dispatch(setSelectedMatch(db[index], "pass"));
      }
    }, 1000);
  };

  const outOfFrame = (name, idx) => {
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };

  return (
    <Box className="main-box-root">
      <Box className="discovery-toolbar">
        <Typography className="discovery-kicker">Discover nearby people</Typography>
        <Button className="filter-trigger" aria-label="Open filters" startIcon={<TuneIcon />} onClick={() => setFiltersOpen((open) => !open)}>Filters</Button>
      </Box>
      {filtersOpen && <Box className="filter-sheet">
        <Typography variant="body2">Age range: {filters.min_age}–{filters.max_age}</Typography>
        <Slider value={[filters.min_age, filters.max_age]} min={18} max={80} onChange={(_, value) => setFilters((prev) => ({ ...prev, min_age: value[0], max_age: value[1] }))} valueLabelDisplay="auto" />
        <Select fullWidth size="small" value={filters.gender} onChange={(event) => setFilters((prev) => ({ ...prev, gender: event.target.value }))}>
          <MenuItem value="any">Any gender</MenuItem><MenuItem value="man">Men</MenuItem><MenuItem value="woman">Women</MenuItem><MenuItem value="more">Other genders</MenuItem>
        </Select>
        <Typography variant="body2" sx={{ mt: 1 }}>Maximum distance: {filters.distance} km</Typography>
        <Slider value={filters.distance} min={1} max={200} onChange={(_, value) => setFilters((prev) => ({ ...prev, distance: value }))} valueLabelDisplay="auto" />
        <Button variant="contained" fullWidth onClick={applyFilters} sx={{ backgroundColor: "#d6002f", mt: 1 }}>Apply filters</Button>
      </Box>}
      <Box mb={2}>
        <Box className="card-container">
          {db.map((character, index) => (
            <TinderCard
              className="swipe"
              ref={childRefs[index]}
              key={character.id}
              onSwipe={(dir) => swiped(dir, character.email, index)}
              onCardLeftScreen={() => outOfFrame(character.email, index)}
            >
              <Box
                className="card"
                style={{
                  backgroundImage: character.profile_picture,
                }}
              >
                <Box
                  variant="span"
                  sx={{
                    marginLeft: "25px",
                    color: "#fff",
                    bottom: "100px",
                    position: "absolute",
                    fontSize: "30px",
                  }}
                >
                  <Typography className="profile-card-name" component="span">{character.first_name}{" "}{character.birthday ? moment().diff(moment(character.birthday), "years") : ""}</Typography>
                  <Typography className="profile-card-meta" component="span">{character.worldwide ? "Worldwide discovery" : character.distance_km != null ? `${character.distance_km} km away` : "Nearby match"}</Typography>
                </Box>
                {currentDirection === "left" && currentIndex === index - 1 ? (
                  <Box
                    variant="span"
                    sx={{
                      color: "red",
                      transform: "rotate(25deg)",
                      padding: "2px",
                      border: "5px solid #f60d0d",
                      marginLeft: "25px",
                      right: "20px",
                      top: "40px",
                      position: "absolute",
                      fontSize: "50px",
                    }}
                  >
                    NOPE
                  </Box>
                ) : null}
                {currentDirection === "right" && currentIndex === index - 1 ? (
                  <Box
                    variant="span"
                    sx={{
                      color: "lightgreen",
                      transform: "rotate(-25deg)",
                      padding: "2px",
                      border: "5px solid lightgreen",
                      marginLeft: "25px",
                      left: "20px",
                      top: "40px",
                      position: "absolute",
                      fontSize: "50px",
                    }}
                  >
                    LIKE
                  </Box>
                ) : null}

                <Box className="card-footer">
                  <Box className="card-footer-bottons">
                    <ReplayIcon
                      sx={{
                        cursor: "pointer",
                        padding: "10px",
                        border: "1px solid orange",
                        borderRadius: "40px",
                        position: "relative",
                        height: "42px",
                        width: "42px",
                        marginRight: "10px",
                        left: "10px",
                        top: "25px",
                        "& > *": {
                          color: "orange",
                          opacity: "1",
                        },
                      }}
                      onClick={() => goBack()}
                    />
                    <CloseIcon
                      sx={{
                        cursor: "pointer",
                        padding: "10px",
                        border: "1px solid #ff6036",
                        borderRadius: "50px",
                        position: "relative",
                        height: "50px",
                        width: "50px",
                        marginRight: "10px",
                        left: "10px",
                        top: "25px",
                        "& > *": {
                          color: "#ff6036",
                          opacity: "1",
                        },
                      }}
                      onClick={() => swipe("left")}
                    />
                    <StarIcon
                      sx={{
                        cursor: "pointer",
                        padding: "10px",
                        border: "1px solid lightblue",
                        borderRadius: "40px",
                        position: "relative",
                        height: "42px",
                        width: "42px",
                        marginRight: "10px",
                        left: "10px",
                        top: "25px",
                        "& > *": {
                          color: "lightblue",
                          opacity: "1",
                        },
                      }}
                      onClick={() => {}}
                    />
                    <FavoriteIcon
                      sx={{
                        cursor: "pointer",
                        padding: "20px",
                        border: "1px solid lightgreen",
                        borderRadius: "50px",
                        position: "relative",
                        height: "31px",
                        width: "31px",
                        marginRight: "10px",
                        left: "10px",
                        top: "25px",
                        "& > *": {
                          color: "lightgreen",
                          opacity: "1",
                        },
                      }}
                      onClick={() => {
                        swipe("right");
                      }}
                    />
                    <BoltIcon
                      sx={{
                        cursor: "pointer",
                        padding: "15px",
                        border: "1px solid #a64aa6",
                        borderRadius: "30px",
                        position: "relative",
                        height: "32px",
                        width: "32px",
                        marginRight: "10px",
                        left: "10px",
                        top: "25px",
                        "& > *": {
                          color: "#a64aa6",
                          opacity: "1",
                        },
                      }}
                      onClick={() => {}}
                    />
                  </Box>
                </Box>
              </Box>
            </TinderCard>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CardsContainer;
