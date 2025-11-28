import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { findUserByEmail, createGoogleUser } from '../models/users.model.js';
import { signToken } from '../utils/jwt.js';

dotenv.config();

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async(accessToken,refreshToken,profile,done)=>{
        const email = profile.emails?.[0]?.value!;
        const picture = profile.photos?.[0]?.value || null ;

        let user = await findUserByEmail(email);

        if(!user){
            user = await createGoogleUser(
                profile.displayName,
                email,
                profile.id,
                picture
            );
        }
        const token = signToken({
            id: user.id,
            email:user.email,
            name: user.name
        });
        done(null, {...user,token});
    })
);

export default passport;