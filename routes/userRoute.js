const router =require("express").Router();
const UserController = require("../controllers/userController")

const { userRegisterValidator } = require("../validations/user.validation");

// api/user

router.post("/register", userRegisterValidator, UserController.register);

router.get("/login", UserController.login);

router.get("/getAll", UserController.getAll);


module.exports = router;