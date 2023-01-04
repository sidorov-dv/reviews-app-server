const UserModel = require("../models/userModel");
const RoleModel = require("../models/roleModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateAccessToken = (id, nickname, email, role) => {
  const payload = {
    id,
    nickname,
    email,
    role,
  };
  return jwt.sign(payload, process.env.SECRET_JWT, { expiresIn: "24h" });
};

class AuthController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Registration errors", errors });
      }
      const { nickname, email, password, avatarUrl } = req.body;
      const candidate = await UserModel.findOne({ email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with this email already exist" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      let role;
      if (email === "demsys14@gmail.com") {
        role = await RoleModel.findOne({ value: "ADMIN" });
      } else {
        role = await RoleModel.findOne({ value: "USER" });
      }
      const user = new UserModel({
        nickname,
        email,
        password: hashPassword,
        role: role.value,
        avatarUrl,
      });
      await user.save();
      const token = generateAccessToken(
        user._id,
        user.nickname,
        user.email,
        user.role
      );
      return res.json({ message: "User created succesfully", token, user });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Registration error" });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Login errors", errors });
      }
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: `User with this email not found` });
      }
      if (!user.avatarUrl) {
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: `Invalid password` });
        }
      }
      const token = generateAccessToken(
        user._id,
        user.nickname,
        user.email,
        user.role
      );
      return res.json({ message: "User login succesfully", token, user });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Login error" });
    }
  }

  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: `User not found` });
      }
      res.json(user);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Get error" });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 });
      res.json(users);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Get error" });
    }
  }

  async findByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return null;
      }
      const token = generateAccessToken(
        user._id,
        user.nickname,
        user.email,
        user.role
      );
      return { token, user };
    } catch (e) {
      console.log(e);
    }
  }

  async createFromSocial(nickname, password, email, avatarUrl) {
    try {
      let role;
      if (email === "demsys14@gmail.com") {
        role = await RoleModel.findOne({ value: "ADMIN" });
      } else {
        role = await RoleModel.findOne({ value: "USER" });
      }
      const user = new UserModel({
        nickname,
        password,
        role: role.value,
        email,
        avatarUrl,
      });
      await user.save();
      const token = generateAccessToken(
        user._id,
        user.nickname,
        user.email,
        user.role
      );
      return { token, user };
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AuthController();
