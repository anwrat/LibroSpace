import express from 'express';
import authRoutes from './routes/auth/auth.routes.js';
import oauthRoutes from './routes/auth/oauth.routes.js';
import otpRoutes from './routes/auth/otp.routes.js';
import adminRoutes from './routes/admin/admin.routes.js';
import userBookRoutes from './routes/users/books.routes.js';
import userShelfRoutes from './routes/users/shelf.routes.js';
import friendRoutes from './routes/users/friends.routes.js';
import communityRoutes from './routes/users/communities.routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './middleware/auth/passport.middleware.js';

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
//Admin Routes
app.use('/api/admin',adminRoutes);
//User Book Routes
app.use('/api/users/books',userBookRoutes);
//User Shelf Routes
app.use('/api/users/shelf',userShelfRoutes);
//Friend Routes
app.use('/api/users/friends',friendRoutes);
//Community Routes
app.use('/api/users/communities',communityRoutes);

export default app;