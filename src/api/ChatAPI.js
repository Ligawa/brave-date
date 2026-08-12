import { sendChatMessage, sendNewMessageMedia } from "./Socket";
import {
  fetchError,
  fetchStart,
  fetchSuccess,
} from "../redux/commonReducer/actions";
import { axiosJson } from "./AxiosConfig";
import {
  sendNewChatMessage,
  setChatUsers,
  setConversation,
  setChatList,
} from "../redux/chatReducer/actions";
import { Server } from "../utils";

var axJson = axiosJson();

export const getChatUsers = () => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    axJson
      .get(`${Server.endpoint}/messages`)
      .then((data) => {
        if (data.data.status_code === 200) {
          dispatch(fetchSuccess());
          dispatch(setChatUsers(data.data.result));
        } else {
          dispatch(fetchError(""));
        }
      })
      .catch(function (error) {
        dispatch(fetchError(""));
      });
  };
};

export const getMessagesList = () => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    axJson
      .get(`${Server.endpoint}/message/users`)
      .then((data) => {
        if (data.data.status_code === 200) {
          dispatch(fetchSuccess());
          dispatch(setChatList(data.data.result));
        } else {
          dispatch(fetchError("Something went wrong"));
          dispatch(setChatList([]));
        }
      })
      .catch(function (error) {
        dispatch(fetchError(""));
        dispatch(setConversation([]));
      });
  };
};

export const getConversation = (receiver) => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    axJson
      .get(`${Server.endpoint}/message`, {
        params: {
          receiver: receiver.email,
        },
      })
      .then((data) => {
        if (data.data.status_code === 200) {
          dispatch(fetchSuccess());
          dispatch(setConversation(data.data.result));
        } else {
          dispatch(fetchError("Something went wrong"));
          dispatch(setConversation([]));
        }
      })
      .catch(function (error) {
        dispatch(fetchError(""));
        dispatch(setConversation([]));
      });
  };
};

export const sendTextMessage = (sender, receiver, message) => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    axJson
      .post(`${Server.endpoint}/messages`, {
        receiver_id: receiver.id || receiver.email,
        content: message,
        type: "text",
      })
      .then(({ data }) => {
        if (data.status_code === 201) {
          dispatch(sendChatMessage({ content: message, type: "text" }));
          dispatch(sendNewChatMessage(message));
          dispatch(fetchSuccess());
        } else {
          dispatch(fetchError(data.message || "Unable to send message."));
        }
      })
      .catch(() => dispatch(fetchError("Unable to send message.")));
  };
};

export const sendNewMediaMessage = (
  receiverID,
  fileContent,
  fileName,
  preview
) => {
  return (dispatch) => {
    dispatch(fetchStart());
    axJson.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
    const [meta, base64] = String(fileContent).split(",");
    const contentType = /data:(.*?);/.exec(meta)?.[1] || "image/jpeg";
    axJson
      .post(`${Server.endpoint}/messages`, {
        receiver_id: receiverID,
        content: base64,
        type: "media",
        media_pathname: fileName,
        content_type: contentType,
      })
      .then(({ data }) => {
        if (data.status_code === 201) {
          dispatch(sendNewMessageMedia(fileContent, fileName, preview));
          dispatch(fetchSuccess());
        } else dispatch(fetchError(data.message || "Unable to send media."));
      })
      .catch(() => dispatch(fetchError("Unable to send media.")));
  };
};
