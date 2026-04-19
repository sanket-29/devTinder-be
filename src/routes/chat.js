const express = require("express");
const user = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {

    const { targetUserId } = req.params;
    const userId = req.user._id;
    try {

        let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] }})
            .populate({
                path: "messages.senderId",
                select: "firstName lastName",
            })

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.json(chat);

    } catch (err) {
        return res.status(500).send("ERROR: " + err.message);
    }

});


module.exports = chatRouter;