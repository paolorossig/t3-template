import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import SpotifyProvider from 'next-auth/providers/spotify';
import { prisma } from '../../server/db/client';
import { env } from '../../env/server.mjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
};
