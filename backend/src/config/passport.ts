import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { User } from '../models';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/oauth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            $or: [
              { socialId: profile.id, authProvider: 'google' },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (user) {
            // Update existing user
            if (user.authProvider === 'local' && !user.socialId) {
              user.authProvider = 'google';
              user.socialId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const username = profile.displayName?.toLowerCase().replace(/\s+/g, '_') || email.split('@')[0];
          const channelName = profile.displayName || username;

          user = await User.create({
            username: `${username}_${Date.now()}`, // Ensure uniqueness
            email,
            authProvider: 'google',
            socialId: profile.id,
            avatar: profile.photos?.[0]?.value,
            channelName,
          });

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL}/oauth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { socialId: profile.id, authProvider: 'facebook' },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (user) {
            if (user.authProvider === 'local' && !user.socialId) {
              user.authProvider = 'facebook';
              user.socialId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Facebook profile'), undefined);
          }

          const username = `${profile.name?.givenName?.toLowerCase()}_${profile.name?.familyName?.toLowerCase()}` || email.split('@')[0];
          const channelName = `${profile.name?.givenName} ${profile.name?.familyName}` || username;

          user = await User.create({
            username: `${username}_${Date.now()}`,
            email,
            authProvider: 'facebook',
            socialId: profile.id,
            avatar: profile.photos?.[0]?.value,
            channelName,
          });

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/oauth/github/callback`,
        scope: ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (error: Error | null, user?: any) => void) => {
        try {
          let user = await User.findOne({
            $or: [
              { socialId: profile.id, authProvider: 'github' },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (user) {
            if (user.authProvider === 'local' && !user.socialId) {
              user.authProvider = 'github';
              user.socialId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in GitHub profile'), undefined);
          }

          const username = profile.username || email.split('@')[0];
          const channelName = profile.displayName || username;

          user = await User.create({
            username: `${username}_${Date.now()}`,
            email,
            authProvider: 'github',
            socialId: profile.id,
            avatar: profile.photos?.[0]?.value,
            channelName,
          });

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Twitter OAuth Strategy
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: `${process.env.API_URL}/oauth/twitter/callback`,
        includeEmail: true,
      },
      async (_token: string, _tokenSecret: string, profile: any, done: (error: Error | null, user?: any) => void) => {
        try {
          let user = await User.findOne({
            $or: [
              { socialId: profile.id, authProvider: 'twitter' },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (user) {
            if (user.authProvider === 'local' && !user.socialId) {
              user.authProvider = 'twitter';
              user.socialId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Twitter profile'), undefined);
          }

          const username = profile.username || email.split('@')[0];
          const channelName = profile.displayName || username;

          user = await User.create({
            username: `${username}_${Date.now()}`,
            email,
            authProvider: 'twitter',
            socialId: profile.id,
            avatar: profile.photos?.[0]?.value,
            channelName,
          });

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
