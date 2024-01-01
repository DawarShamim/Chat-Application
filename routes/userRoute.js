const router =require("express").Router();
const UserController = require("../controllers/userController")

const { userRegisterValidator } = require("../validations/user.validation");

router.post("/register", userRegisterValidator, UserController.register);

router.get("/login", UserController.login);

module.exports = router;