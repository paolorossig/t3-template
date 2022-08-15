import NextAuth from 'next-auth';
import { authOptions } from 'server/auth/next-auth';

export default NextAuth(authOptions);
