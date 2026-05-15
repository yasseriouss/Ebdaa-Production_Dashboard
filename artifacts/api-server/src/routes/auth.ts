import { Router, type IRouter } from "express";
import { AuthController } from "../controllers/auth.controller";

const router: IRouter = Router();

router.post("/auth/login", AuthController.login);
router.get("/auth/me", AuthController.me);

router.get("/auth/catalog", AuthController.catalog);
router.get("/auth/roles-matrix", AuthController.rolesMatrix);
router.get("/auth/users", AuthController.users);
router.put("/auth/matrix", AuthController.putMatrix);
router.post("/auth/users", AuthController.createUser);
router.put("/auth/users/:userId/roles", AuthController.putUserRoles);
router.get("/auth/session", AuthController.session);
router.get("/auth/effective-permissions", AuthController.effective);

export default router;
