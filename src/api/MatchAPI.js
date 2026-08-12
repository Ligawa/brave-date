import {
  setMatchUsers,
  setUsers,
} from "../redux/matchReducer/actions";
import {
  fetchError,
  fetchStart,
  fetchSuccess,
} from "../redux/commonReducer/actions";
import { axiosJson } from "./AxiosConfig";

import { Server } from "../utils";

var axJson = axiosJson();

export const updateLocation = (latitude, longitude) => (dispatch) => {
  axJson.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("token");
  return axJson.put(`${Server.endpoint}/user/location`, { latitude, longitude }).then(({ data }) => {
    if (data.status_code !== 200) dispatch(fetchError(data.message));
  }).catch(() => dispatch(fetchError("Unable to update your location.")));
};

export const getUserMatches = () => {
  return (dispatch) => {
    dispatch(fetchStart());
    const user = localStorage.getItem("user");
    if (user) {
      axJson.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axJson
        .get(`${Server.endpoint}/matches`, {
          params: { user: user.email },
        })
        .then(({ data }) => {
          if (data.status_code === 200) {
            dispatch(fetchSuccess());
            dispatch(setMatchUsers(data.result));
          } else {
            dispatch(fetchError(data.message));
          }
        })
        .catch(function (error) {
          dispatch(fetchError(""));
        });
    }
  };
};

export const setInitialUsers = (filters = {}) => {
  return (dispatch) => {
    dispatch(fetchStart());
    const user = localStorage.getItem("user");
    if (user) {
      axJson.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axJson
        .get(`${Server.endpoint}/user/all`, {
          params: { user: user.email, ...filters },
        })
        .then(({ data }) => {
          if (data.status_code === 200) {
            dispatch(fetchSuccess());
            dispatch(setUsers(data.result));
          } else {
            dispatch(fetchError(data.message));
          }
        })
        .catch(function (error) {
          dispatch(fetchError(""));
        });
    }
  };
};

export const setSelectedMatch = (user, direction = "like") => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    axJson
      .post(`${Server.endpoint}/swipes`, { target_id: user.id, target_email: user.email, direction })
      .then(({ data }) => {
        if (data.status_code === 201) {
          dispatch(fetchSuccess());
          dispatch(getUserMatches());
        } else {
          dispatch(fetchError(data.message));
        }
      })
      .catch(function (error) {
        dispatch(fetchError(error));
      });
  };
};
