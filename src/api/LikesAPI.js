import { axiosJson } from "./AxiosConfig";
import { Server } from "../utils";
import { fetchError, fetchStart, fetchSuccess } from "../redux/commonReducer/actions";

const axJson = axiosJson();
const auth = () => { axJson.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("token"); };

export const getReceivedLikes = (onResult) => (dispatch) => {
  dispatch(fetchStart()); auth();
  axJson.get(`${Server.endpoint}/likes`).then(({ data }) => {
    if (data.status_code === 200) { dispatch(fetchSuccess()); onResult(data.result || []); }
    else dispatch(fetchError(data.message));
  }).catch((error) => dispatch(fetchError(error.response?.data?.message || "Unable to load likes.")));
};

export const respondToLike = (user, direction, onComplete) => (dispatch) => {
  dispatch(fetchStart()); auth();
  axJson.post(`${Server.endpoint}/likes`, { target_id: user.id, target_email: user.email, direction }).then(({ data }) => {
    if (data.status_code === 201) { dispatch(fetchSuccess()); onComplete(data); }
    else dispatch(fetchError(data.message));
  }).catch((error) => dispatch(fetchError(error.response?.data?.message || "Unable to respond to this like.")));
};
