import { Router } from "express";
import {
  addUserFriend,
  createUser,
  deleteUser,
  getFriendList,
  getUser,
  loginUser,
  searchUser,
  updateAvatarUser,
  updateUser,
} from "../controllers/user.controllers.js";
import { verifyUser } from "../middleware/verifyUser.js";
import { upload } from "../middleware/uploadfile.js";

const router = Router();
// router.use(verifyUser);

router.route("/create").post(createUser);

router.route("/").post(loginUser).patch(updateUser).delete(deleteUser);

router.route("/search").get(searchUser);
router
  .route("/avatar")
  .post(verifyUser, upload.single("avatar_file"), updateAvatarUser);

router.route("/:id").get(getUser);

router.route("/friend-list/:id").get(getFriendList).post(addUserFriend);

export default router;
