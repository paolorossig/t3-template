import type { Account } from '@prisma/client';
import { prisma } from 'server/db/client';
import spotifyApi from 'lib/spotify';
import { getErrorMessage, getErrorName } from 'utils/error';

type AccountKeys = Pick<Account, 'provider' | 'providerAccountId'>;

export const getAccountTokens = async ({
  provider,
  providerAccountId,
}: AccountKeys) => {
  const partialAccount = await prisma.account.findFirst({
    where: { provider, providerAccountId },
    select: { access_token: true, refresh_token: true, expires_at: true },
  });

  if (!partialAccount) {
    const errorMessage = 'No account found in DB';
    console.error('Error @ getAccountTokens:\n', errorMessage);
    throw new Error(errorMessage);
  }

  return partialAccount;
};

export const updateAccountTokens = async (
  { provider, providerAccountId }: AccountKeys,
  data: Partial<Account>
) =>
  prisma.account.update({
    where: {
      provider_providerAccountId: { provider, providerAccountId },
    },
    data,
  });

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken();

    return refreshedToken;
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    switch (getErrorName(error)) {
      case 'WebapiAuthenticationError':
        console.error('Error @ refreshAccessToken:\n', errorMessage);
        break;
      default:
        console.error('Unknown Error @ refreshAccessToken:\n', errorMessage);
        break;
    }

    return null;
  }
};
