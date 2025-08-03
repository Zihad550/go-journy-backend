import { Response } from "express";
import env from "../../env";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    });
  }
};
