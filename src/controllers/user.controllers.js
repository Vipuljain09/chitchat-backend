import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

/*
take the information like (userName,email,password)
first verify the inputs field
check if there is any user with given username or email
check the password regex 
then create the new user, and genrate the accesstoken 
and send the response to user.
*/
export const createUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!userName?.trim() || !email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required field are missing"));
  }

  const userNameVal = userName?.trim()?.toLowerCase();
  const emailVal = email?.trim()?.toLowerCase();
  const usersByUserName = await User.find({ userName: userNameVal });
  const usersByemail = await User.find({ email: emailVal });

  if (usersByUserName?.length > 0) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "userName already been used, Try with different one"
        )
      );
  }

  if (usersByemail?.length > 0) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Email already been used, Try with different email"
        )
      );
  }

  if (!passwordRegex.test(password?.trim())) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Password should contain lower-case, upper-case, digit and specail character and have atleast 8 character long."
        )
      );
  }

  const newUser = new User({
    userName: userNameVal,
    email: emailVal,
    password: password?.trim(),
  });
  const accessTokenVal = await newUser.generateAccessToken();

  newUser.accessToken = accessTokenVal;
  await newUser.save();
  const newUserDetails = await User.findById(newUser._id).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, "User created successfully", newUserDetails));
});

/*
take the email,password
check the basic validation
check user existed or not with given email
then compare the password
at last send the response to user
*/
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Required field are missing"));
  }

  const emailVal = email?.trim()?.toLowerCase();
  const usersByemail = await User.find({ email: emailVal });

  if (usersByemail?.length === 0) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const userInfo = usersByemail[0];
  const checkPassword = await userInfo.isPasswordCorrect(password);

  if (!checkPassword) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Credentail's does not match"));
  }

  const userDetailWithoutPassword = await User.findById(userInfo._id).select(
    "-password"
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "User login Successfully", userDetailWithoutPassword)
    );
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const isValidUserId = isValidObjectId(id);

  if (!isValidUserId) {
    return res.status(400).json(new ApiResponse(400, "Invalid User Id."));
  }
  const userDetail = await User.findById(id).select("-password -accessToken");

  res
    .status(200)
    .json(new ApiResponse(200, "User fetch Successfully", userDetail));
});

/*
->First we see the id is valid or not
->Then we that user is exist or not with given valid id
->then we updated the userInfo
*/
export const updateUser = asyncHandler(async (req, res) => {
  const { data } = req.body;
  const { id } = req.params;
  console.log(data);
  
  const isValidUserId = isValidObjectId(id);

  if (!isValidUserId) {
    return res.status(400).json(new ApiResponse(400, "UserId is not valid"));
  }

  const userDetail = await User.findById(id);
  if (!userDetail) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const updatedUserInfo = await User.findByIdAndUpdate(
    id,
    {
      ...data,
    },
    { new: true }
  ).select("-password -friendList");

  res
    .status(200)
    .json(
      new ApiResponse(200, "User data updated Successfully", updatedUserInfo)
    );
});

export const updateAvatarUser = asyncHandler(async (req, res) => {
  const AvatarInfo = req?.file;
  const userInfo = req.user;
  const { id } = req.params;
  if (!AvatarInfo?.path) {
    return res.status(404).json(new ApiResponse(404, "File not found"));
  }
  const userDetail = await User.findById(id);

  if (!userDetail) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const avatarCloudinaryReponse = await uploadOnCloudinary(AvatarInfo?.path);

  const url = avatarCloudinaryReponse?.url;

  if (!url) {
    return res.status(400).json(new ApiResponse(400, "Updated failed."));
  }

  userDetail.avatar = url;
  await userDetail.save();

  const updatedUserInfo = await User.findById(userDetail?._id).select(
    "-password"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Avatar Updated successfully", updatedUserInfo));
});
export const deleteUser = asyncHandler(async (req, res) => {});

/*
extract the searchText
check basic validation on searchText

*/
export const searchUser = asyncHandler(async (req, res) => {
  const searchWord = req?.query?.userName;

  console.log(searchWord);

  if (!searchWord || searchWord?.trim() === "") {
    return res
      .status(200)
      .json(new ApiResponse(200, "No user's found", { data: [] }));
  }

  const regexPattern = `^${searchWord}`;
  const response = await User.find({
    userName: { $regex: regexPattern },
  }).select("-password -accessToken");

  res
    .status(200)
    .json(new ApiResponse(200, "User's fetch successfully", response));
});

export const getFriendList = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const isValidUserId = isValidObjectId(userId);

  if (!isValidUserId) {
    return res.status(400).json(new ApiResponse(400, "UserId is not valid"));
  }

  const userDetail = await User.findById(userId);

  if (!userDetail) {
    return res.status(404).json(new ApiResponse(404, "User Details not found"));
  }

  const friendsList = userDetail?.friendList || [];

  const result = [];

  const response = friendsList?.map(async (data) => {
    const friendInfo = await User.findById(data?.id).select(
      "-password -accessToken -friendList"
    );
    result.push({ ...friendInfo._doc, unseenMessage: 0 });
    return result;
  });
  await Promise.all(response);

  res
    .status(200)
    .json(new ApiResponse(200, "Friend List fetched Successfully", result));
});

export const addUserFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const userId = req.params.id;
  console.log(userId, friendId);

  const isValidUserId = isValidObjectId(userId);
  const isValidFriendId = isValidObjectId(friendId);

  if (!isValidFriendId || !isValidUserId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "UserId or FriendId is missing or not valid"));
  }

  const userDetail = await User.findById(userId);
  const friendDetail = await User.findById(friendId);

  if (!userDetail) {
    return res.status(404).json(new ApiResponse(404, "User Details not found"));
  }

  if (!friendDetail) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Friend Details not found"));
  }

  const intialList = userDetail?.friendList || [];
  const intialList2 = friendDetail?.friendList || [];

  userDetail.friendList = [{ id: friendId, type: "Single" }, ...intialList];
  friendDetail.friendList = [{ id: userId, type: "Single" }, ...intialList2];
  await userDetail.save();
  await friendDetail.save();

  const updatedUserInfo = await User.findById(userDetail?._id).select(
    "-password -accessToken"
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Friend's added successfully in List",
        updatedUserInfo
      )
    );
});
