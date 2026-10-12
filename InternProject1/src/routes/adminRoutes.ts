
import express from "express";
import adminController from "../controllers/adminController";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware";
import { validation } from "../middlewares/validatemiddleware";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { adminCreateTaskSchema } from "../validators/taskValidator";

const router = express.Router();

router.post("/register",validation(registerSchema),adminController.register);
router.post("/login",validation(loginSchema),adminController.login);
router.get("/users",adminAuthMiddleware,adminController.seeAllUsers);
router.get("/users/:user_id",adminAuthMiddleware,adminController.seeUser);
router.post("/tasks",adminAuthMiddleware,validation(adminCreateTaskSchema),adminController.createTaskForUser);
// router.delete("/users/:user_id",adminAuthMiddleware,adminController.deleteUser);
// router.put("/users/:user_id",adminAuthMiddleware,adminController.updateUser);
router.get("/tasks",adminAuthMiddleware,adminController.seeAdminTasks);

export default router;