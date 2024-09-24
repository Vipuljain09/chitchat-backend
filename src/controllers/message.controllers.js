import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { MessageRecipient } from "../models/message_recipient.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const responseMessage = (statusCode, message = "Success", data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    success: statusCode < 400,
  };
};
/*

*/
export const saveMessage = async (data) => {
  try {
    const { content, senderId, time, parentMessageId } = data;

    if (!content || !senderId || !time) {
      return responseMessage(400, "Field's are missing.");
    }

    const isValidSenderId = isValidObjectId(senderId);
    if (!isValidSenderId) {
      return responseMessage(400, "Sender Id is inValid.");
    }

    const senderUser = await User.findById(senderId);
    if (senderUser?.length) {
      return responseMessage(400, "Sender not found");
    }

    const message = new Message({
      content: content,
      createdBy: senderId,
      parentMessageId: parentMessageId,
      time: time,
    });

    await message.save();

    const messageDetail = await Message.findById(message?._id);

    if (!messageDetail) {
      return responseMessage(
        400,
        "something went wrong during create message."
      );
    }

    return responseMessage(200, "Message store successfully", messageDetail);
  } catch (error) {
    return {
      status: 400,
      message:
        error?.message || "Something went wrong during store the message.",
    };
  }
};

/*

*/
export const createMessageRecipient = async (data) => {
  try {
    const { receiverId, groupReciverId, messageId } = data;

    if (!receiverId && !groupReciverId) {
      return responseMessage(
        400,
        "receiverId and groupReciverId both are not found."
      );
    }

    const isValidReceiverId = isValidObjectId(receiverId);
    const isValidGroupReciverId = isValidObjectId(groupReciverId);
    const isMessageIdValid = isValidObjectId(messageId);

    if (!messageId || !isMessageIdValid) {
      return responseMessage(400, "Message Id not found or invalid.");
    }

    if (receiverId && !isValidReceiverId) {
      return responseMessage(400, "Reciever Id is not valid.");
    }
    if (groupReciverId && !isValidGroupReciverId) {
      return responseMessage(400, "GroupReciever Id is not valid.");
    }

    const messageRecipent = new MessageRecipient({
      recipientId: receiverId,
      recipientGroupId: groupReciverId,
      messageId: messageId,
    });
    await messageRecipent.save();
    const messageRecipentDetail = await MessageRecipient.findById(
      messageRecipent?._id
    );

    if (!messageRecipentDetail) {
      return responseMessage(
        400,
        "something went wrong during create messageRecipient."
      );
    }

    return responseMessage(
      200,
      "Message Recipient create successfully",
      messageRecipentDetail
    );
  } catch (error) {
    return responseMessage(
      400,
      error?.message || "Something went wrong during store the message."
    );
  }
};

export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { friendList } = req.body;

  const isValidUserId = isValidObjectId(userId);

  if (!isValidUserId) {
    return res.status(400).json(new ApiResponse(400, "UserId is not valid"));
  }

  const userDetail = await User.findById(userId);

  if (!userDetail) {
    return res.status(404).json(new ApiResponse(404, "User Details not found"));
  }

  let chatHistoryResult = [];

  const r = await MessageRecipient.aggregate([
    {
      $lookup: {
        from: "messages", // Name of the Message collection
        localField: "messageId",
        foreignField: "_id",
        as: "messageInfo",
      },
    },
    {
      $unwind: "$messageInfo",
    },
    {
      $match: {
        $or: [
          { recipientId: userId }, // Match the recipientId
          { "messageInfo.messageCreatorId": messageCreatorId }, // Match messageCreatorId inside messageInfo
        ],
      },
    },
  ]);
  res.status(200).json(new ApiResponse(200, "Chat fetched successfully", r));
});
