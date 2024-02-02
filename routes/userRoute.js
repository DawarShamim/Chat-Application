const router = require("express").Router();
const UserController = require("../controllers/userController");
const { Authentication } = require("../Auth");

const { userRegisterValidator } = require("../validations/user.validation");

router.post("/signup", userRegisterValidator, UserController.register);

router.post("/login", UserController.login);

router.get("/allConversations", Authentication, UserController.allConversations);

module.exports = router;