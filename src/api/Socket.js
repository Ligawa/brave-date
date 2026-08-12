import { receiveNewChatMessage, receiveMediaMessage } from "../redux/chatReducer/actions";
import { supabase } from "./SupabaseClient";

let chatChannel = null;
let activeConversation = null;

const token = () => localStorage.getItem("token");

const normalizeMessage = (row, senderId) => ({
  id: row.id,
  content: row.content,
  type: row.sender_id === senderId ? "sent" : "received",
  message_type: row.message_type || "text",
  media_pathname: row.media_pathname || null,
  created_at: row.created_at,
});

const postMessage = async (message) => {
  const authToken = token();
  if (!authToken || !activeConversation) return;

  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      receiver_id: activeConversation.receiverId,
      content: message.content || null,
      type: message.type || "text",
      media_pathname: message.media_pathname || null,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to send message");
  }
};

export const initiateChatSocket = (sender, receiver) => {
  return (dispatch) => {
    if (!supabase || !sender?.id || !receiver?.id) return;

    const conversationKey = [sender.id, receiver.id].sort().join(":");
    activeConversation = { senderId: sender.id, receiverId: receiver.id };

    if (chatChannel) {
      supabase.removeChannel(chatChannel);
      chatChannel = null;
    }

    const authToken = token();
    if (authToken) supabase.realtime.setAuth(authToken);

    chatChannel = supabase
      .channel(`dating-messages:${conversationKey}`, {
        config: { broadcast: { self: false }, presence: { key: sender.id } },
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dating_messages" },
        ({ new: message }) => {
          const belongsToConversation =
            (message.sender_id === sender.id && message.receiver_id === receiver.id) ||
            (message.sender_id === receiver.id && message.receiver_id === sender.id);

          if (!belongsToConversation) return;

          const normalized = normalizeMessage(message, sender.id);
          if (normalized.message_type === "media") {
            dispatch(receiveMediaMessage(normalized));
          } else if (normalized.type === "received") {
            dispatch(receiveNewChatMessage(normalized));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[v0] Supabase Realtime channel unavailable", status);
        }
      });
  };
};

export const sendChatMessage = (message) => {
  return () => {
    postMessage(message).catch((error) => {
      console.error("[v0] Failed to persist realtime message", error);
    });
  };
};

export const sendNewMessageMedia = (fileContent, fileName, preview) => {
  return () => {
    postMessage({
      content: fileContent,
      type: "media",
      media_pathname: preview || fileName,
    }).catch((error) => {
      console.error("[v0] Failed to persist realtime media message", error);
    });
  };
};

export const leaveMatchSocket = () => {
  return () => {
    if (supabase && chatChannel) {
      supabase.removeChannel(chatChannel);
      chatChannel = null;
      activeConversation = null;
    }
  };
};
