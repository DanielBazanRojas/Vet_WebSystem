import * as authService from './auth.service.js';

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const result = await authService.login(email, password, ip, userAgent);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000 // 20 minutos
    });

    res.json({
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({ message: error.message || 'Error de autenticación' });
  }
};

export const refresh = async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No se proporcionó refresh token' });
    }

    const result = await authService.refresh(refreshToken);

    // Extender la cookie en el navegador por otros 20 minutos
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000 // 20 minutos
    });

    res.json({ accessToken: result.accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión' });
  }
};

export const me = (req, res) => {
  res.json({ user: req.user });
};
