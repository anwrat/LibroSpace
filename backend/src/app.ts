import express from 'express';
import authRoutes from './routes/auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
//For cookie handling
app.use(cookieParser());
//For CORS
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
}));


//Authentication
app.use('/api/auth',authRoutes); 
//OAuth Routes
app.use('/api/oauth',oauthRoutes); 

export default app;