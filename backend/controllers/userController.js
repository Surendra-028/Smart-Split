const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const setToken = (user) => {
    return jwt.sign(
        { id : user._id, name : user.name, email : user.email, balance : user.balance},
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )
}


// all users
const handleGetAll = async (req, res) => {
    const users = await User.find({})
    try {
        return res.json({success : true, users : users})
    } catch (error) {
        console.log(error)
        return res.json({success : false, message : error})
    }
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = setToken(user)
            return res.status(200).json({ success: true, message: "Login Successful", token })
        } else {
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const handleRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email : email })
        if (userExists) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" })
        }

        const salt = await bcrypt.genSalt(12)
        const hashedPass = await bcrypt.hash(password, salt)
        
        const newUser = await User.create({
            name,
            email,
            password: hashedPass,
            balance : 1000
        })

        const token = setToken(newUser)
        return res.status(201).json({ success: true, message: "Registration Successful", token })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return null;
    }
}

// handle get Details
const handleGetDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        return res.json({success : true, user : user})
    } catch (error) {
        console.log(error)
        return res.json({success : false, message : error})
    }
}

module.exports = {
    handleLogin,
    handleRegister,
    handleGetAll,
    verifyToken,
    handleGetDetails
}