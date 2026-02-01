import { authMiddleware } from "./../../middleware/auth";
import { Router } from "express";
import { UserService } from "./user.service";
import { RegisterDto } from "./dto/register.dto";
import { validateDto } from "../../middleware/validation-middleware";

const router = Router();
const userService = new UserService();

router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body;
  const user = await userService.register(email, password, displayName);
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.login(email, password);
  res.json(user);
});

router.get("/profile/:userID", authMiddleware, async (req, res) => {
  const { userID } = req.params;
  const user = await userService.getProfile(Number(userID));
  res.json(user);
});

router.patch("/profile/:userID", authMiddleware, async (req, res) => {
  const { userID } = req.params;
  const { displayName, password } = req.body;
  const user = await userService.updateProfile(
    Number(userID),
    displayName,
    password
  );
  res.json(user);
});

export default router;
