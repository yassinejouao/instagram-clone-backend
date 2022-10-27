const bcrypt = require("bcrypt");
const User = require("../Models/userModel");

//dont work right now
// const deleteUser = async (req, res) => {
//   if (req.user.username === req.params.username || req.user.role === "admin") {
//     res.status(200).json("User has been deleted.");
//   } else {
//     res.status(403).json("You are not allowed to delete this user!");
//   }
// };
const updateUser = async (req, res) => {
  if (req.user._id === req.params.id || req.user.role === "admin") {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        res.status(500).send({
          status: "failure",
          message: e.message,
        });
      }
    }
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      const { jwtToken, password, ...other } = user._doc;
      if (!user) {
        return res.status(400).send({
          status: "failure",
          message: "you can't update this account.",
        });
      }
      res.status(200).send({
        status: "success",
        message: "Account has been updated successfully",
        user: other,
      });
    } catch (e) {
      res.status(500).send({
        status: "failure",
        message: "something is wrong !",
      });
    }
  } else {
    return res.status(400).send({
      status: "failure",
      message: "you can't update this account.",
    });
  }
};
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new Error("user does not exist");
    }
    const { password, jwtToken, __v, role, ...otherInfo } = user._doc;
    res.status(200).send({
      status: "success",
      message: "user info",
      user: otherInfo,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      throw new Error("user does not exist");
    }
    const { password, jwtToken, __v, role, ...otherInfo } = user._doc;
    res.status(200).send({
      status: "success",
      message: "user info",
      user: otherInfo,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getFollowings = async (req, res) => {
  try {
    const username = req.params.username;
    const userfollowings = await User.findOne({ username: username });
    if (!userfollowings) {
      throw new Error("user does not exist");
    }
    const followings = await Promise.all(
      userfollowings.followings.map((following) => {
        return User.findById(following, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      followings: followings,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getFollowers = async (req, res) => {
  try {
    const username = req.params.username;
    const userfollowers = await User.findOne({ username: username });
    if (!userfollowers) {
      throw new Error("user does not exist");
    }
    const followers = await Promise.all(
      userfollowers.followers.map((follower) => {
        return User.findById(follower, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      data: {
        followings: followers,
      },
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const followUser = async (req, res) => {
  try {
    const currentUser = await User.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const usertofollow = await User.findOne({
        username: req.params.username,
      });
      if (!usertofollow) {
        throw new Error("user does not exist");
      }
      if (!currentUser.followings.includes(usertofollow._id)) {
        await currentUser.updateOne({
          $push: { followings: usertofollow._id },
        });
        await usertofollow.updateOne({
          $push: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been followed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you allready follow this user",
        });
      }
    } else {
      throw new Error("you can't follow yourself");
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const unfollowUser = async (req, res) => {
  try {
    const currentUser = await User.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const usertounfollow = await User.findOne({
        username: req.params.username,
      });
      if (!usertounfollow) {
        throw new Error("user does not exist");
      }
      if (currentUser.followings.includes(usertounfollow._id)) {
        await currentUser.updateOne({
          $pull: { followings: usertounfollow._id },
        });
        await usertounfollow.updateOne({
          $pull: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been unfollowed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you don't follow this user",
        });
      }
    } else {
      throw new Error("you can't unfollow yourself");
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const searchUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const users = await User.find({
      username: { $regex: search, $options: "i" },
    })
      .select("_id username profilePicture")
      .limit(limit);
    const totalUsers = users.length;
    res.status(200).send({
      status: "success",
      totalUsers: totalUsers,
      limit: limit,
      users: users,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
module.exports = {
  deleteUser,
  updateUser,
  getUser,
  getFollowings,
  getFollowers,
  followUser,
  unfollowUser,
  searchUsers,
  getUserByUsername,
};
