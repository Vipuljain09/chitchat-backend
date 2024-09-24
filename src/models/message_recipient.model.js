import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const messageRecipientSchema = new Schema(
  {
    recipientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    recipientGroupId: {
      type: mongoose.Types.ObjectId,
      ref: "Usergroup",
    },
    messageId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageRecipientSchema.plugin(mongooseAggregatePaginate);
export const MessageRecipient = mongoose.model(
  "MessageRecipient",
  messageRecipientSchema
);
