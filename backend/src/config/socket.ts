import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { messageSchema } from "../schemas/friends.schema.js";
import { saveMessage } from "../models/friends/messages.model.js";

interface RoomUser {
  socketId: string;
  userName: string;
  userId: number | string;
}

const usersInRooms: { [roomId: string]: RoomUser[] } = {};
const socketToRoom: { [socketId: string]: string } = {};

const activeUsers = new Map<number, string>();

const sendOnlineStatus = (io: Server) => {
  const onlineList = Array.from(activeUsers.keys());
  io.emit("online_users", onlineList);
};

export const initSocket = (io: Server) => {
  const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
      const headerCookie = socket.handshake.headers.cookie;
      if (!headerCookie)
        return next(new Error("Authentication error: No cookies"));

      const cookies = cookie.parse(headerCookie);
      const token = cookies.token;
      if (!token) return next(new Error("Authentication error: Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
      };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  };

  io.use(authMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).user.id;
    activeUsers.set(userId, socket.id);
    sendOnlineStatus(io);

    socket.on("send_private_message", async (rawData) => {
      try {
        const validation = messageSchema.safeParse(rawData);
        if (!validation.success)
          return socket.emit("error_message", { error: "Invalid data" });

        const { receiverId, content } = validation.data;
        const savedMsg = await saveMessage(userId, receiverId, content);
        const receiverSocketId = activeUsers.get(receiverId);

        if (receiverSocketId)
          io.to(receiverSocketId).emit("receive_message", savedMsg);
        socket.emit("message_sent_success", savedMsg);
      } catch (err) {
        socket.emit("error_message", { error: "Could not send message" });
      }
    });

    socket.on("mark_as_read", ({ senderId }) => {
      const senderSocketId = activeUsers.get(Number(senderId));
      if (senderSocketId)
        io.to(senderSocketId).emit("messages_seen", {
          readerId: userId,
          senderId,
        });
    });

    socket.on("send_challenge", ({ receiverId, challengerName }) => {
      const receiverSocketId = activeUsers.get(Number(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_challenge", {
          message: `${challengerName} has sent you a challenge!`,
          fromId: userId,
        });
      }
    });

    socket.on("send_book_request", ({ receiverId, senderName, bookTitle }) => {
      const receiverSocketId = activeUsers.get(Number(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_book_request", {
          type: "book_request",
          message: `${senderName} requested to swap: ${bookTitle}`,
          bookTitle,
          senderName,
          created_at: new Date(),
        });
      }
    });

    socket.on(
      "swap_response",
      ({ receiverId, senderName, bookTitle, status }) => {
        const receiverSocketId = activeUsers.get(Number(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_swap_update", {
            message: `${senderName} has ${status} your request for: ${bookTitle}`,
            status,
            senderName,
            bookTitle,
          });
        }
      },
    );

    socket.on("disconnect", () => {
      activeUsers.delete(userId);
      sendOnlineStatus(io);
    });
  });

  const liveNamespace = io.of("/live");
  liveNamespace.use(authMiddleware);

  liveNamespace.on("connection", (socket: Socket) => {
    socket.on(
      "join-room",
      ({
        communityId,
        userName,
        userId,
      }: {
        communityId: string;
        userName: string;
        userId: number | string;
      }) => {
        const userObject: RoomUser = {
          socketId: socket.id,
          userName: userName || "Anonymous",
          userId: userId || (socket as any).user.id,
        };

        if (usersInRooms[communityId]) {
          const isAlreadyInRoom = usersInRooms[communityId].some(
            (user) => user.socketId === socket.id,
          );
          if (!isAlreadyInRoom) {
            usersInRooms[communityId].push(userObject);
          }
        } else {
          usersInRooms[communityId] = [userObject];
        }

        socketToRoom[socket.id] = communityId;
        socket.join(communityId);

        const usersInThisRoom = usersInRooms[communityId].filter(
          (user) => user.socketId !== socket.id,
        );
        socket.emit("all-users", usersInThisRoom);
      },
    );

    socket.on(
      "sending-signal",
      (payload: {
        userToSignal: string;
        signal: any;
        userName: string;
        userId: number | string;
      }) => {
        liveNamespace.to(payload.userToSignal).emit("user-joined", {
          signal: payload.signal,
          callerID: socket.id,
          userName: payload.userName,
          userId: payload.userId,
        });
      },
    );

    socket.on("returning-signal", (payload) => {
      liveNamespace.to(payload.callerID).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("leave-room", ({ communityId }) => {
      handleLiveCleanup(socket, communityId);
    });

    socket.on("host-ended-room", ({ communityId }) => {
      liveNamespace.to(communityId).emit("room-ended");
    });

    socket.on("disconnect", () => {
      const communityId = socketToRoom[socket.id];
      if (communityId) {
        handleLiveCleanup(socket, communityId);
      }
    });
  });
};

function handleLiveCleanup(socket: Socket, communityId: string) {
  if (usersInRooms[communityId]) {
    usersInRooms[communityId] = usersInRooms[communityId].filter(
      (user) => user.socketId !== socket.id,
    );
    if (usersInRooms[communityId].length === 0)
      delete usersInRooms[communityId];
  }
  delete socketToRoom[socket.id];
  socket.leave(communityId);
  socket.to(communityId).emit("user-disconnected", socket.id);
}
