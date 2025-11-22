let sessionUserId: string | null = typeof window !== "undefined" ? localStorage.getItem("soins_user_id") : null;
let sessionAccessToken: string | null = typeof window !== "undefined" ? localStorage.getItem("soins_access_token") : null;

export const setSessionUser = (userId: string) => {
  sessionUserId = userId;
  if (typeof window !== "undefined") {
    localStorage.setItem("soins_user_id", userId);
  }
};

export const getSessionUser = () => sessionUserId;

export const setAccessToken = (token: string) => {
  sessionAccessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("soins_access_token", token);
  }
};

export const getAccessToken = () => sessionAccessToken;

export const clearSession = () => {
  sessionUserId = null;
  sessionAccessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("soins_user_id");
    localStorage.removeItem("soins_access_token");
  }
};

