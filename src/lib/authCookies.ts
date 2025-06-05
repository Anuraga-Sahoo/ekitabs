
import { NextApiResponse } from 'next';
import { serialize, CookieSerializeOptions } from 'cookie';

export const AUTH_TOKEN_NAME = 'authToken';

export function setAuthCookie(res: NextApiResponse, token: string) {
  const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  };
  res.setHeader('Set-Cookie', serialize(AUTH_TOKEN_NAME, token, cookieOptions));
}

export function clearAuthCookie(res: NextApiResponse) {
  const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(0), // Set to a past date
    path: '/',
    sameSite: 'lax',
  };
  res.setHeader('Set-Cookie', serialize(AUTH_TOKEN_NAME, '', cookieOptions));
}
