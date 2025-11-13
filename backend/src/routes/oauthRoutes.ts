import express, { Request, Response } from "express";
import passport from "../config/passport";
import { OAuthService } from "../services";
import { IUser } from "../types";

const router = express.Router();
const oauthService = new OAuthService();

// Frontend redirect URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Helper function to handle OAuth callback
 */
const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user) {
      return res.redirect(
        `${FRONTEND_URL}/auth/login?error=authentication_failed`
      );
    }

    const result = await oauthService.handleOAuthCallback(user);

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${result.token}`);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    res.redirect(
      `${FRONTEND_URL}/auth/login?error=${encodeURIComponent(error.message)}`
    );
  }
};

// Google OAuth Routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("Google OAuth is configured.");
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${FRONTEND_URL}/auth/login?error=google_auth_failed`,
      session: false,
    }),
    handleOAuthCallback
  );
} else {
  console.log(
    "Google OAuth is not configured.",
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  router.get("/google", (_req, res) => {
    res.redirect(`${FRONTEND_URL}/auth/login?error=google_not_configured`);
  });
}

// Facebook OAuth Routes
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get(
    "/facebook",
    passport.authenticate("facebook", {
      scope: ["email"],
    })
  );

  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
      failureRedirect: `${FRONTEND_URL}/auth/login?error=facebook_auth_failed`,
      session: false,
    }),
    handleOAuthCallback
  );
} else {
  router.get("/facebook", (_req, res) => {
    res.redirect(`${FRONTEND_URL}/auth/login?error=facebook_not_configured`);
  });
}

// GitHub OAuth Routes
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get(
    "/github",
    passport.authenticate("github", {
      scope: ["user:email"],
    })
  );

  router.get(
    "/github/callback",
    passport.authenticate("github", {
      failureRedirect: `${FRONTEND_URL}/auth/login?error=github_auth_failed`,
      session: false,
    }),
    handleOAuthCallback
  );
} else {
  router.get("/github", (_req, res) => {
    res.redirect(`${FRONTEND_URL}/auth/login?error=github_not_configured`);
  });
}

// Twitter OAuth 2.0 Routes
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  console.log("Twitter OAuth 2.0 is configured.");
  router.get(
    "/twitter",
    passport.authenticate("twitter", {
      scope: ["tweet.read", "users.read", "offline.access"],
    })
  );

  router.get(
    "/twitter/callback",
    passport.authenticate("twitter", {
      failureRedirect: `${FRONTEND_URL}/auth/login?error=twitter_auth_failed`,
      session: false,
    }),
    handleOAuthCallback
  );
} else {
  console.log(
    "Twitter OAuth 2.0 is not configured.",
    process.env.TWITTER_CLIENT_ID,
    process.env.TWITTER_CLIENT_SECRET
  );
  // Fallback for when Twitter OAuth is not configured
  router.get("/twitter", (_req, res) => {
    res.redirect(`${FRONTEND_URL}/auth/login?error=twitter_not_configured`);
  });
}

export default router;
