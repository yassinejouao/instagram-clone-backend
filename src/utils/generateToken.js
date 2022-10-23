const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "mySecretKeyfromenv",
    { expiresIn: "2s" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "myRefreshSecretKeyfromenv"
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
