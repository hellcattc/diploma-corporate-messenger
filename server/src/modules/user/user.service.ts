import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { generateToken } from "../../config/auth";

export class UserService {
  async register(email: string, password: string, displayName: string) {
    const existingUser = await UserRepository.findOne({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User();
    user.email = email;
    user.passwordHash = passwordHash;
    user.displayName = displayName;

    await UserRepository.save(user);

    // Генерируем токен для нового пользователя
    const token = generateToken(user.id);

    // Возвращаем пользователя и токен (как при логине)
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await UserRepository.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw new Error("Invalid password");

    const token = generateToken(user.id);
    return { user, token };
  }

  async getProfile(userID: number) {
    const user = await UserRepository.findOne({ where: { id: userID } });
    if (!user) throw new Error("User not found");

    // Не возвращаем passwordHash в профиле
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }

  async updateProfile(userID: number, displayName?: string, password?: string) {
    const user = await UserRepository.findOne({ where: { id: userID } });
    if (!user) throw new Error("User not found");

    if (displayName) user.displayName = displayName;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await UserRepository.save(user);

    // Не возвращаем passwordHash
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }
}
