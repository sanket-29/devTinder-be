const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const { Connection } = require("mongoose");

const getSecretRoomId = (userId, targetUserId) => {

    return crypto.createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");

}
const initializeSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {

        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);

            // console.log(`${firstName} joined the chat room: ${roomId}`);

            socket.join(roomId);

        });

        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {

            try {

                const roomId = getSecretRoomId(userId, targetUserId);

                // console.log(`Message from ${firstName} in room ${roomId}: ${text}`);

                const connection = await ConnectionRequest.findOne({$or: [
                    {fromUserId: userId, toUserId: targetUserId, status: "accepted"},
                    {fromUserId: targetUserId, toUserId: userId, status: "accepted"},
                ]});

                if (!connection) {
                    console.error("Users are not connected. Message will not be saved or broadcasted.");
                    return;
                }

                let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });

                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    });

                }

                chat.messages.push({
                    senderId: userId,
                    text,
                });

                await chat.save();

                io.to(roomId).emit("receiveMessage", {
                    firstName,
                    lastName,
                    userId,
                    text,                  
                });

            } catch (err) {
                console.error("Error saving message to database:", err);
            }




        });

        socket.on("disconnect", () => {

        });
    });
}

module.exports = initializeSocket;