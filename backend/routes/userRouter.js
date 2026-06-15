const express = require('express')
const { handleLogin, handleRegister, handleGetAll, handleGetDetails } = require('../controllers/userController')
const userRouter = express.Router()
const { security } = require('../middlewares/auth')

userRouter
.post("/login", handleLogin)
.post("/register", handleRegister)
.get("/all", handleGetAll)
.get("/:id", handleGetDetails)


module.exports = {
    userRouter
}