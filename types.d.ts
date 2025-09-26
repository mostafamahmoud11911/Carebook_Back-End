declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    NODE_ENV?: "development" | "production" | "test";
    PORT?: string;
  }
}

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {




    interface Request {
      user?: {
        id: number;
        role: "admin" | "user" | "provider";
      }
    }
  }
}
