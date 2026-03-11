import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from './config/socket.js';
dotenv.config();

const httpServer = createServer(app);
const io = new Server(httpServer,{
    cors:{
        origin: process.env.CLIENT_URL,
        methods: ["GET","POST"],
    }
});

initSocket(io);

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})