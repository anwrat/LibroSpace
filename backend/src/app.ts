import express from 'express';
import authRoutes from './routes/auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import otpRoutes from './routes/otp.routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './middleware/passport.middleware.js';

const app = express();
app.use(express.json());
//For cookie handling
app.use(cookieParser());
app.use(passport.initialize());
//For CORS
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
}));


//Authentication
app.use('/api/auth',authRoutes); 
//OAuth Routes
app.use('/api/oauth',oauthRoutes); 
//OTP Routes
app.use('/api/otp',otpRoutes);

export default app;