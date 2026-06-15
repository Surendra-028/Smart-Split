const { verifyToken } = require("../controllers/userController");

const security = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "You Should Login" });
    }
    
    const user = verifyToken(token);
    if (user) {
        req.body.userId = user.id;
        return next();
    } else {
        return res.json({ success: false, message: "You Should Login" });
    }
};

module.exports = {
    security
};