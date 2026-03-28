import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie'; 
import { messageSchema } from '../schemas/friends.schema.js';
import { saveMessage } from '../models/friends/messages.model.js';

// Track online users: { userId: socketId }
const activeUsers = new Map<number, string>();
const sendOnlineStatus = (io: Server) => {
    const onlineList = Array.from(activeUsers.keys());
    io.emit('online_users', onlineList);
};

export const initSocket = (io: Server) => {
  
  // 1. JWT Middleware for HttpOnly Cookies
  io.use((socket, next) => {
    try {
      const headerCookie = socket.handshake.headers.cookie;

      if (!headerCookie) {
        console.error("Socket Auth: No cookies found in headers");
        return next(new Error("Authentication error: No cookies found"));
      }

      // Parse the cookies from the header
      const cookies = cookie.parse(headerCookie);
      const token = cookies.token; 

      if (!token) {
        console.error("Socket Auth: Token not found in cookies");
        return next(new Error("Authentication error: Token missing"));
      }

      // Verify the JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      
      // Attach verified user to the socket
      (socket as any).user = decoded;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // 2. Connection Logic
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    
    // Register user in the active map
    activeUsers.set(userId, socket.id);
    console.log(`⚡ Verified Connection: User ${userId} (Socket: ${socket.id})`);
    sendOnlineStatus(io); // Notify everyone

    // 3. Handle Private Messaging
    socket.on('send_private_message', async (rawData) => {
      try {
        const validation = messageSchema.safeParse(rawData);
        
        if (!validation.success) {
          console.log("Step 2 Validation failed: ");
          return socket.emit('error_message', { error: "Invalid message data" });
        }

        const { receiverId, content } = validation.data;
        const senderId = userId; // Secure: Use ID from JWT, not frontend payload

        // Save to Database
        const savedMsg = await saveMessage(senderId, receiverId, content);
        if(!savedMsg){
          console.error("Failed to save message to database");
        }

        // Send to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', savedMsg);
        }

        // Send confirmation to sender
        socket.emit('message_sent_success', savedMsg);

      } catch (err) {
        console.error("Socket Message Error:", err);
        socket.emit('error_message', { error: "Could not send message" });
      }
    });

    socket.on('mark_as_read', ({senderId})=>{
      const readerId = userId;
      const senderSocketId = activeUsers.get(Number(senderId));
      if(senderSocketId){
        io.to(senderSocketId).emit('messages_seen', {readerId, senderId});
      }
    })

    socket.on('send_challenge', ({ receiverId, challengerName }) => {
      const receiverSocketId = activeUsers.get(Number(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_challenge', {
          message: `${challengerName} has sent you a challenge!`,
          fromId: userId
        });
      }
    });

    // Send Book Swap Request Notification
    socket.on('send_book_request', ({ receiverId, senderName, bookTitle }) => {
        // Get the socket ID from activeUsers Map
        const receiverSocketId = activeUsers.get(Number(receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_book_request', {
                type: 'book_request',
                message: `${senderName} requested to swap: ${bookTitle}`,
                bookTitle: bookTitle,
                senderName: senderName,
                created_at: new Date()
            });
            console.log(`Sent book request from ${senderName} to user ${receiverId}`);
        }
    });
    
    // 4. Handle Disconnect
    socket.on('disconnect', () => {
      activeUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    });
  });
};