import { Server, Socket } from 'socket.io';
import { messageSchema } from '../schemas/friends.schema.js';
import { saveMessage } from '../models/friends/messages.model.js';

// This map acts like a "phone book"
// Key: User ID (e.g., 5) | Value: Socket ID (e.g., "abc-123")
const activeUsers = new Map<number, string>();

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // 1. REGISTER USER
    // The frontend will send the userID as soon as they log in
    socket.on('register_user', (userId: number) => {
      activeUsers.set(userId, socket.id);
      console.log(`User ${userId} is now online with socket ${socket.id}`);
    });

    // 2. PRIVATE MESSAGE
    socket.on('send_private_message', async (data) => {
    // A. Validate data with Zod
    const validated = messageSchema.safeParse(data);
    if (!validated.success) return;

    // B. Save to Database (No res.status here!)
    const dbMessage = await saveMessage(data.senderId, data.receiverId, data.content);

    // C. Send to receiver
    const receiverSocketId = activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', dbMessage);
    }
  });

    // 3. DISCONNECT
    socket.on('disconnect', () => {
      // Find and remove the user from our map when they close the tab
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} went offline.`);
          break;
        }
      }
    });
  });
};