import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie'; 
import { messageSchema } from '../schemas/friends.schema.js';
import { saveMessage } from '../models/friends/messages.model.js';

// Track online users on main space: { userId: socketId }
const activeUsers = new Map<number, string>();

// WebRTC State Trackers for the Isolated /live Namespace
const usersInRooms: Record<string, string[]> = {};
const socketToRoom: Record<string, string> = {};

const sendOnlineStatus = (io: Server) => {
    const onlineList = Array.from(activeUsers.keys());
    io.emit('online_users', onlineList);
};

export const initSocket = (io: Server) => {
  
  // 1. SHARED JWT COOKIE AUTH MIDDLEWARE
  const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
      const headerCookie = socket.handshake.headers.cookie;

      if (!headerCookie) {
        console.error("Socket Auth: No cookies found in headers");
        return next(new Error("Authentication error: No cookies found"));
      }

      const cookies = cookie.parse(headerCookie);
      const token = cookies.token; 

      if (!token) {
        console.error("Socket Auth: Token not found in cookies");
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err);
      return next(new Error("Authentication error: Invalid token"));
    }
  };

  // Attach auth middleware to default namespace
  io.use(authMiddleware);

  // 2. DEFAULT NAMESPACE (Messaging, Challenges & Notifications)
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    
    activeUsers.set(userId, socket.id);
    console.log(`⚡ Verified Global Connection: User ${userId} (Socket: ${socket.id})`);
    sendOnlineStatus(io);

    socket.on('send_private_message', async (rawData) => {
      try {
        const validation = messageSchema.safeParse(rawData);
        if (!validation.success) {
          return socket.emit('error_message', { error: "Invalid message data" });
        }

        const { receiverId, content } = validation.data;
        const senderId = userId;

        const savedMsg = await saveMessage(senderId, receiverId, content);
        const receiverSocketId = activeUsers.get(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', savedMsg);
        }
        socket.emit('message_sent_success', savedMsg);
      } catch (err) {
        console.error("Socket Message Error:", err);
        socket.emit('error_message', { error: "Could not send message" });
      }
    });

    socket.on('mark_as_read', ({ senderId }) => {
      const readerId = userId;
      const senderSocketId = activeUsers.get(Number(senderId));
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_seen', { readerId, senderId });
      }
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
                bookTitle: bookTitle,
                senderName: senderName,
                created_at: new Date()
            });
        }
    });

    socket.on('swap_response', ({ receiverId, senderName, bookTitle, status }) => {
        const receiverSocketId = activeUsers.get(Number(receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_swap_update', {
                message: `${senderName} has ${status} your request for: ${bookTitle}`,
                status: status,
                senderName: senderName, 
                bookTitle: bookTitle    
            });
        }
    });
    
    socket.on('disconnect', () => {
      activeUsers.delete(userId);
      console.log(`❌ Global User ${userId} disconnected`);
      sendOnlineStatus(io);
    });
  });

  // 3. ISOLATED '/live' NAMESPACE (WebRTC Video Room Signaling)
  const liveNamespace = io.of('/live');
  
  // Protect the live namespace using the exact same security rules
  liveNamespace.use(authMiddleware);

  liveNamespace.on('connection', (socket: Socket) => {
    const liveUserId = (socket as any).user.id;
    console.log(`🎥 Isolated Live Room Connection: User ${liveUserId} (Namespace Socket: ${socket.id})`);

    socket.on("join-room", ({ communityId }: { communityId: string }) => {
      console.log(`👤 Socket ${socket.id} joined room space: ${communityId}`);
      
      if (usersInRooms[communityId]) {
        if (!usersInRooms[communityId].includes(socket.id)) {
          usersInRooms[communityId].push(socket.id);
        }
      } else {
        usersInRooms[communityId] = [socket.id];
      }
      
      socketToRoom[socket.id] = communityId;
      socket.join(communityId);

      // Return a listing of all other sockets currently inside this live call
      const usersInThisRoom = usersInRooms[communityId].filter(id => id !== socket.id);
      socket.emit("all-users", usersInThisRoom);
    });

    socket.on("sending-signal", (payload) => {
      liveNamespace.to(payload.userToSignal).emit("user-joined", { 
        signal: payload.signal, 
        callerID: socket.id // Must pass the sender's actual socket.id for response loops
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

    socket.on('disconnect', () => {
      const communityId = socketToRoom[socket.id];
      if (communityId) {
        handleLiveCleanup(socket, communityId);
      }
      console.log(`❌ Live Socket disconnected: ${socket.id}`);
    });
  });
};

// Pure Room Helper to keep connection code clean
function handleLiveCleanup(socket: Socket, communityId: string) {
  if (usersInRooms[communityId]) {
    usersInRooms[communityId] = usersInRooms[communityId].filter(id => id !== socket.id);
    if (usersInRooms[communityId].length === 0) {
      delete usersInRooms[communityId];
    }
  }
  delete socketToRoom[socket.id];
  socket.leave(communityId);
  socket.to(communityId).emit("user-disconnected", socket.id);
}