import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import {
  createMessageRecipient,
  saveMessage,
} from "./controllers/message.controllers.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log(`User Connected: ${socket.id} ${socket.handshake.auth.userId}`);
  socket.join(userId);

  socket.on("send_message", async (data) => {
    const receiverId  = data?.receiverId
    socket.to(receiverId).emit("receive_message", data);

    const saveMessageResponse = await saveMessage(data);
    console.log(saveMessageResponse, saveMessageResponse?.data?._id);
    const saveMessageRecipientResponse = await createMessageRecipient({
      ...data,
      messageId: saveMessageResponse?.data?._id,
    });
    console.log(saveMessageRecipientResponse);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export default server;
