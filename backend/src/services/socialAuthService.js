import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorHandler.js';
import {
  createSocialUser,
  findUserByEmail,
  findUserBySocialIdentity,
} from '../models/userModel.js';

const providers = {
  google: {
    clientId: 'GOOGLE_CLIENT_ID',
    clientSecret: 'GOOGLE_CLIENT_SECRET',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
  },
  facebook: {
    clientId: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    authorizationUrl: 'https://www.facebook.com/v20.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v20.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,email,first_name,last_name,name',
    scope: 'email,public_profile',
  },
  twitter: {
    clientId: 'TWITTER_CLIENT_ID',
    clientSecret: 'TWITTER_CLIENT_SECRET',
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url',
    scope: 'users.read tweet.read offline.access',
  },
};

const stateExpiry = '10m';
export const SOCIAL_STATE_COOKIE = 'social_auth_state';

const getProvider = (name) => {
  const provider = providers[name];
  if (!provider) {
    throw new ApiError(404, 'Proveedor de autenticación no disponible.');
  }
  return provider;
};

const getCallbackUrl = (name) => {
  const baseUrl = process.env.SOCIAL_AUTH_CALLBACK_BASE_URL;
  if (!baseUrl) {
    throw new ApiError(503, 'El inicio de sesión social no está configurado.');
  }
  return `${baseUrl.replace(/\/$/, '')}/${name}/callback`;
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || '').split(',')[0].trim();

const getConfiguredProvider = (name) => {
  const provider = getProvider(name);
  const clientId = process.env[provider.clientId];
  const clientSecret = process.env[provider.clientSecret];

  if (!clientId || !clientSecret) {
    throw new ApiError(503, 'Este proveedor de autenticación no está configurado.');
  }

  return { ...provider, clientId, clientSecret };
};

const createCodeVerifier = () =>
  crypto.randomBytes(32).toString('base64url');

const createCodeChallenge = (verifier) =>
  crypto.createHash('sha256').update(verifier).digest('base64url');

const createState = (provider, codeVerifier) =>
  jwt.sign({ provider, codeVerifier }, process.env.JWT_SECRET, {
    expiresIn: stateExpiry,
  });

export const createAuthorizationUrl = (name) => {
  const provider = getConfiguredProvider(name);
  const callbackUrl = getCallbackUrl(name);
  const codeVerifier = createCodeVerifier();
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: provider.scope,
    state: createState(name, codeVerifier),
  });

  if (name === 'google' || name === 'twitter') {
    params.set('code_challenge', createCodeChallenge(codeVerifier));
    params.set('code_challenge_method', 'S256');
  }

  if (name === 'google') {
    params.set('access_type', 'online');
    params.set('prompt', 'select_account');
  }

  return {
    url: `${provider.authorizationUrl}?${params}`,
    state: params.get('state'),
  };
};

const readJson = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(502, 'El proveedor social rechazó la autenticación.');
  }
  return body;
};

const exchangeCode = async (name, provider, code, codeVerifier) => {
  const callbackUrl = getCallbackUrl(name);
  const body = new URLSearchParams({
    code,
    client_id: provider.clientId,
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code',
  });

  const headers = { 'content-type': 'application/x-www-form-urlencoded' };
  if (name === 'google' || name === 'twitter') {
    body.set('code_verifier', codeVerifier);
  }

  if (name === 'twitter') {
    headers.authorization = `Basic ${Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString('base64')}`;
  } else {
    body.set('client_secret', provider.clientSecret);
  }

  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers,
    body,
  });
  const tokens = await readJson(response);
  if (!tokens.access_token) {
    throw new ApiError(502, 'El proveedor social no devolvió un token válido.');
  }
  return tokens.access_token;
};

const getProfile = async (provider, accessToken) => {
  const response = await fetch(provider.userInfoUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  return readJson(response);
};

const normalizeProfile = (name, profile) => {
  if (name === 'twitter') {
    return {
      providerId: profile.data?.id,
      email: null,
      firstName: profile.data?.name || profile.data?.username,
      lastName: '',
    };
  }

  if (name === 'facebook') {
    return {
      providerId: profile.id,
      email: profile.email,
      firstName: profile.first_name || profile.name?.split(' ')[0],
      lastName: profile.last_name || '',
    };
  }

  return {
    providerId: profile.sub,
    email: profile.email,
    emailVerified: profile.email_verified === true,
    firstName: profile.given_name,
    lastName: profile.family_name || '',
  };
};

export const authenticateWithProvider = async (
  executor,
  name,
  code,
  state,
  expectedState
) => {
  if (!state || !expectedState || state !== expectedState) {
    throw new ApiError(400, 'El estado de autenticación social no es válido.');
  }

  const decoded = jwt.verify(state, process.env.JWT_SECRET);
  if (decoded.provider !== name || !decoded.codeVerifier) {
    throw new ApiError(400, 'El estado de autenticación social no es válido.');
  }

  const provider = getConfiguredProvider(name);
  const accessToken = await exchangeCode(name, provider, code, decoded.codeVerifier);
  const profile = normalizeProfile(name, await getProfile(provider, accessToken));

  if (!profile.providerId || !profile.firstName) {
    throw new ApiError(502, 'El proveedor no devolvió una identidad válida.');
  }

  if (name === 'google' && !profile.emailVerified) {
    throw new ApiError(400, 'La cuenta de Google no tiene un correo verificado.');
  }

  let user = await findUserBySocialIdentity(executor, name, profile.providerId);
  if (!user) {
    if (!profile.email) {
      throw new ApiError(400, 'Este proveedor no proporcionó un correo electrónico.');
    }

    const existing = await findUserByEmail(executor, profile.email.toLowerCase());
    if (existing) {
      throw new ApiError(409, 'La cuenta ya existe. Inicia sesión con correo y contraseña para vincularla.');
    }

    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    user = await createSocialUser(executor, {
      firstName: profile.firstName.slice(0, 100),
      lastName: profile.lastName.slice(0, 100) || 'Usuario',
      email: profile.email.toLowerCase(),
      passwordHash,
      provider: name,
      providerId: profile.providerId,
    });
  }

  return user;
};

export const getSocialFrontendErrorUrl = (message) => {
  const frontendUrl = getFrontendUrl();
  const target = new URL(frontendUrl || '/', 'http://localhost');
  target.pathname = '/login';
  target.searchParams.set('social_error', message);
  return frontendUrl ? target.toString() : '/login';
};