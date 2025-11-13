import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as TwitterStrategy } from '@superfaceai/passport-twitter-oauth2';
import { User } from '../models';

/**
 * Generate a unique username within the 30-character limit
 * Format: truncated_username + random suffix
 */
function generateUsername(baseUsername: string): string {
  // Clean the username (remove special chars, convert to lowercase)
  const cleaned = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Generate a random 6-character suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);

  // Max username length is 30, so: baseUsername + _ + suffix (6 chars) = 23 chars max for base
  const maxBaseLength = 30 - 1 - suffix.length; // 30 - underscore - suffix
  const truncatedBase = cleaned.substring(0, maxBaseLength);

  return `${truncatedBase}_${suffix}`;
}

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

          const baseUsername = profile.displayName || email.split('@')[0];
          const username = generateUsername(baseUsername);
          const channelName = profile.displayName || baseUsername;

          user = await User.create({
            username,
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

          const baseUsername = profile.name?.givenName || email.split('@')[0];
          const username = generateUsername(baseUsername);
          const channelName = `${profile.name?.givenName} ${profile.name?.familyName}` || baseUsername;

          user = await User.create({
            username,
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

          const baseUsername = profile.username || email.split('@')[0];
          const username = generateUsername(baseUsername);
          const channelName = profile.displayName || baseUsername;

          user = await User.create({
            username,
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

// Twitter OAuth 2.0 Strategy
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  console.log('Twitter OAuth 2.0 Configuration:', {
    hasClientId: !!process.env.TWITTER_CLIENT_ID,
    hasClientSecret: !!process.env.TWITTER_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/oauth/twitter/callback`,
  });

  passport.use(
    new TwitterStrategy(
      {
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/oauth/twitter/callback`,
        clientType: 'confidential',
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (error: Error | null, user?: any) => void) => {
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

          // Twitter often doesn't provide email - generate a placeholder
          const email = profile.emails?.[0]?.value || `twitter_${profile.id}@placeholder.com`;

          const baseUsername = profile.username || profile.displayName?.toLowerCase().replace(/\s+/g, '_') || `user${profile.id}`;
          const username = generateUsername(baseUsername);
          const channelName = profile.displayName || profile.username || username;

          user = await User.create({
            username,
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
