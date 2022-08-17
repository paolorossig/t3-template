import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import SpotifyProvider from 'next-auth/providers/spotify';
import { prisma } from 'server/db/client';
import { env } from 'env/server.mjs';
import { LOGIN_URL } from 'lib/spotify';
import { getAccountTokens, refreshAccessToken, updateAccountTokens } from '.';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, isNewUser }) {
      console.log('JWT Callback');

      if (user && account) {
        const { expires_at, provider, providerAccountId } = account;
        const accountKeys = { provider, providerAccountId };

        if (isNewUser) {
          console.log('New user signed:', user.name);
        } else {
          console.log('User signed:', user.name);
          await updateAccountTokens(accountKeys, account);
        }

        return {
          ...token,
          provider,
          providerAccountId,
          accessTokenExpiresAt: expires_at,
        };
      }

      const { accessTokenExpiresAt, provider, providerAccountId } = token;
      const accountKeys = { provider, providerAccountId };

      if (accessTokenExpiresAt && Date.now() > accessTokenExpiresAt * 1000) {
        console.log('Access Token expired');

        const { refresh_token } = await getAccountTokens(accountKeys);
        if (!refresh_token) {
          throw new Error('No refresh token found in DB');
        }

        const refreshedTokenResponse = await refreshAccessToken(refresh_token);
        if (!refreshedTokenResponse) {
          throw new Error('No refreshedTokenResponse');
        }

        const { expires_in, ...rest } = refreshedTokenResponse;
        const expires_at = Date.now() + expires_in * 1000;

        await updateAccountTokens(accountKeys, {
          ...rest,
          expires_at,
        });

        return {
          ...token,
          accessTokenExpiresAt: expires_at,
        };
      }

      return token;
    },
  },
};
