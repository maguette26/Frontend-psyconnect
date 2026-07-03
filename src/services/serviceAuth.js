import api from './api';

const USER_INFO_KEY = 'currentUserInfo';

export const login = async (email, motDePasse) => {
  console.log(`serviceAuth: Tentative de connexion pour ${email}`);
  try {
    // ✅ username/password — correspond au filtre Spring
    const response = await api.post('/auth/login', {
      username: email,
      password: motDePasse
    });

    const userInfo = response.data;
    console.log("serviceAuth: Connexion réussie:", userInfo);

    if (userInfo?.token) {
      localStorage.setItem('token', userInfo.token);
    }

    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    return userInfo;

  } catch (error) {
    console.error("serviceAuth: Erreur de connexion:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error("serviceAuth: Erreur logout:", error.message);
  } finally {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem('token');
    console.log("serviceAuth: Session effacée.");
  }
};

export const getCurrentUserInfo = () => {
  const str = localStorage.getItem(USER_INFO_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, motDePasse) => {
  const response = await api.post("/auth/reset-password", {
    token,
    motDePasse
  });
  return response.data;
};