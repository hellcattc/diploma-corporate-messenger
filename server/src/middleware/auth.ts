import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/auth";

export interface CustomRequest extends Request {
  userID?: string;
}

export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return; // Завершаем выполнение
  }
  
  try {
    const payload = verifyToken(token);
    req.userID = payload.userID.toString();
    next(); // Переходим к следующему middleware или обработчику
  } catch (err) {
    console.log("token bad");
    res.status(401).json({ message: "Invalid token" });
  }
};
