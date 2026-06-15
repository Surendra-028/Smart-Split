require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')
const {userRouter} = require('./routes/userRouter')
const { groupRouter } = require('./routes/groupRouter')

const app = express()
const PORT = process.env.PORT

//connections
connectDB();

// uses
app.use(express.json())
app.use(cors({ origin : "https://frontend-8pf9.onrender.com", credentials : true}))

//routes
app.use("/api/user", userRouter)
app.use("/api/group", groupRouter)

app.get("/", (req, res) => {
    return res.status(200).send("API Working Successfully")
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    return res.status(500).json({ success: false, message: "Internal server error state reached." })
})

app.listen(PORT, () => {
    console.log(`Server running securely on port ${PORT}`)
})
