import mongoose, { Schema } from "mongoose";

const userGroupSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Types.ObjectId,
      ref: "Group",
    },
    isActive: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const UserGroup = mongoose.model("UserGroup", userGroupSchema);
