import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie'; 
import { messageSchema } from '../schemas/friends.schema.js';
import { saveMessage } from '../models/friends/messages.model.js';

const activeUsers = new Map<number, string>();
const usersInRooms: Record<string, string[]> = {};
const socketToRoom: Record<string, string> = {};

const sendOnlineStatus = (io: Server) => {
    const onlineList = Array.from(activeUsers.keys());
    io.emit('online_users', onlineList);
};

export const initSocket = (io: Server) => {
  
  const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
      const headerCookie = socket.handshake.headers.cookie;
      if (!headerCookie) return next(new Error("Authentication error: No cookies"));

      const cookies = cookie.parse(headerCookie);
      const token = cookies.token; 
      if (!token) return next(new Error("Authentication error: Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  };

  io.use(authMiddleware);

  // Default Namespace (Messaging & Notifications)
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    activeUsers.set(userId, socket.id);
    sendOnlineStatus(io);

    socket.on('send_private_message', async (rawData) => {
      try {
        const validation = messageSchema.safeParse(rawData);
        if (!validation.success) return socket.emit('error_message', { error: "Invalid data" });

        const { receiverId, content } = validation.data;
        const savedMsg = await saveMessage(userId, receiverId, content);
        const receiverSocketId = activeUsers.get(receiverId);
        
        if (receiverSocketId) io.to(receiverSocketId).emit('receive_message', savedMsg);
        socket.emit('message_sent_success', savedMsg);
      } catch (err) {
        socket.emit('error_message', { error: "Could not send message" });
      }
    });

    socket.on('mark_as_read', ({ senderId }) => {
      const senderSocketId = activeUsers.get(Number(senderId));
      if (senderSocketId) io.to(senderSocketId).emit('messages_seen', { readerId: userId, senderId });
    });

    socket.on('send_challenge', ({ receiverId, challengerName }) => {
      const receiverSocketId = activeUsers.get(Number(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_challenge', {
          message: `${challengerName} has sent you a challenge!`,
          fromId: userId
        });
      }
    });

    socket.on('send_book_request', ({ receiverId, senderName, bookTitle }) => {
        const receiverSocketId = activeUsers.get(Number(receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_book_request', {
                type: 'book_request',
                message: `${senderName} requested to swap: ${bookTitle}`,
                bookTitle, senderName, created_at: new Date()
            });
        }
    });

    socket.on('swap_response', ({ receiverId, senderName, bookTitle, status }) => {
        const receiverSocketId = activeUsers.get(Number(receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_swap_update', {
                message: `${senderName} has ${status} your request for: ${bookTitle}`,
                status, senderName, bookTitle    
            });
        }
    });
    
    socket.on('disconnect', () => {
      activeUsers.delete(userId);
      sendOnlineStatus(io);
    });
  });

  // ISOLATED '/live' NAMESPACE (WebRTC Signaling Fixes)
  const liveNamespace = io.of('/live');
  liveNamespace.use(authMiddleware);

  liveNamespace.on('connection', (socket: Socket) => {

    socket.on("join-room", ({ communityId }: { communityId: string }) => {
      if (usersInRooms[communityId]) {
        if (!usersInRooms[communityId].includes(socket.id)) {
          usersInRooms[communityId].push(socket.id);
        }
      } else {
        usersInRooms[communityId] = [socket.id];
      }
      
      socketToRoom[socket.id] = communityId;
      socket.join(communityId);

      // Send a complete array of existing connection IDs back to the joining user
      const usersInThisRoom = usersInRooms[communityId].filter(id => id !== socket.id);
      socket.emit("all-users", usersInThisRoom);
    });

    socket.on("sending-signal", (payload) => {
      // FIX: Explicitly send the current user's actual live socket context
      liveNamespace.to(payload.userToSignal).emit("user-joined", { 
        signal: payload.signal, 
        callerID: socket.id 
      });
    });

    socket.on("returning-signal", (payload) => {
      liveNamespace.to(payload.callerID).emit("receiving-returned-signal", { 
        signal: payload.signal, 
        id: socket.id 
      });
    });

    socket.on("leave-room", ({ communityId }) => {
      handleLiveCleanup(socket, communityId);
    });

    socket.on("host-ended-room", ({ communityId }) => {
      // Broadcast eviction to all users connected to the space
      liveNamespace.to(communityId).emit("room-ended");
    });

    socket.on('disconnect', () => {
      const communityId = socketToRoom[socket.id];
      if (communityId) {
        handleLiveCleanup(socket, communityId);
      }
    });
  });
};

function handleLiveCleanup(socket: Socket, communityId: string) {
  if (usersInRooms[communityId]) {
    usersInRooms[communityId] = usersInRooms[communityId].filter(id => id !== socket.id);
    if (usersInRooms[communityId].length === 0) delete usersInRooms[communityId];
  }
  delete socketToRoom[socket.id];
  socket.leave(communityId);
  socket.to(communityId).emit("user-disconnected", socket.id);
}