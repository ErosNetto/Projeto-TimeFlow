const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  userCreateValidation,
  userLoginValidation,
} = require("../middlewares/userValidations");
const userAuthGuard = require("../middlewares/userAuthGuard");

//Routes
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", userLoginValidation(), validate, login);
router.get("/profile", userAuthGuard, getCurrentUser);

module.exports = router;
