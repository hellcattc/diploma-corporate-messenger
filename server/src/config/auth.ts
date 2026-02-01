import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const generateToken = (userID: number) => {
  return jwt.sign({ userID }, JWT_SECRET, { expiresIn: "4h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userID: number };
};
