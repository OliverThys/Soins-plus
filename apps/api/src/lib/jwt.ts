import { FastifyInstance } from "fastify";
import { env } from "../config/env";
import jwt from "jsonwebtoken";

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: "15m" });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret);

export const authenticate = async (app: FastifyInstance, token?: string) => {
  if (!token) throw new Error("Token missing");
  return app.jwt.verify(token);
};

