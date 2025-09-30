// types/express.d.ts

export interface UserJWT {
  id: number;
  role: "admin" | "user" | "provider";
}

export interface UserGoogle {
  id: string;
  email: string;
  name: string;
  refreshToken?: string | null;
  profile?: any; // أو تعمل interface مظبوط للـ profile
}

declare global {
  namespace Express {
    interface Request {
      user?: UserJWT | UserGoogle;
    }
  }
}
