import { Request } from "express";
import passport, { Profile } from "passport";
import googleOauth, { VerifyCallback } from "passport-google-oauth2";
const GoogleStrategy = googleOauth.Strategy;
import dotenv from "dotenv";

dotenv.config()

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(
  (
    user: {
      id: string;
      name: string;
      email: string;
      refreshToken?: string;
    },
    done
  ) => {
    done(null, user);
  }
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK!,
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        return done(null, {profile, refreshToken});
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
