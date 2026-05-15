import type { Request, Response } from "express";
import { z } from "zod";
import { ALL_PERMISSION_KEYS } from "@workspace/db";
import { AuthAdminService } from "../services/authAdmin.service";
import { AuthLoginService } from "../services/authLogin.service";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    if (!AuthLoginService.isLoginAvailable()) {
      res.status(503).json({
        error: "login_unconfigured",
        hint: "Set JWT_SECRET (16+ chars) and BOOTSTRAP_ADMIN_PASSWORD to enable password login.",
      });
      return;
    }
    try {
      const Body = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      const { email, password } = Body.parse(req.body);
      const result = await AuthLoginService.login(email, password);
      if ("error" in result) {
        if (result.error === "login_unconfigured") {
          res.status(503).json({ error: result.error });
          return;
        }
        res.status(401).json({ error: "invalid_credentials" });
        return;
      }
      res.json({ accessToken: result.accessToken, tokenType: "Bearer" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bad request";
      res.status(400).json({ error: msg });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    if (req.auth.kind !== "user") {
      res.json({ user: null });
      return;
    }
    const full = await AuthLoginService.me(req.auth.userId);
    if (!full || full.kind !== "user") {
      res.status(401).json({ error: "invalid_session" });
      return;
    }
    res.json({
      user: {
        id: full.userId,
        email: full.email,
        employeeId: full.employeeId,
      },
      permissionKeys: full.permissionKeys,
      dataScope: full.dataScope,
    });
  }

  static catalog(_req: Request, res: Response): void {
    res.json(AuthAdminService.getCatalog());
  }

  static async rolesMatrix(_req: Request, res: Response): Promise<void> {
    try {
      const rows = await AuthAdminService.getRoleMatrix();
      res.json(rows);
    } catch {
      res.status(500).json({ error: "Failed to load roles matrix" });
    }
  }

  static async users(_req: Request, res: Response): Promise<void> {
    try {
      const rows = await AuthAdminService.listUsersWithAccess();
      res.json(rows);
    } catch {
      res.status(500).json({ error: "Failed to load users" });
    }
  }

  static async putMatrix(req: Request, res: Response): Promise<void> {
    try {
      const Body = z.object({
        roles: z.record(z.array(z.string())),
      });
      const { roles } = Body.parse(req.body);
      await AuthAdminService.replacePermissionsMatrix(roles);
      res.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid body";
      res.status(400).json({ error: msg });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const Body = z.object({ email: z.string().email() });
      const { email } = Body.parse(req.body);
      const row = await AuthAdminService.createUserPlaceholder(email);
      res.status(201).json(row);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid body";
      res.status(400).json({ error: msg });
    }
  }

  static async putUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const Body = z.object({ roleIds: z.array(z.string()) });
      const { roleIds } = Body.parse(req.body);
      const rawUserId = req.params.userId;
      const userId = typeof rawUserId === "string" ? rawUserId : rawUserId?.[0];
      if (!userId) {
        res.status(400).json({ error: "Missing user id" });
        return;
      }
      await AuthAdminService.setUserRoles(userId, roleIds);
      res.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid body";
      res.status(400).json({ error: msg });
    }
  }

  static session(req: Request, res: Response): void {
    const auth = req.auth;
    res.json({
      kind: auth.kind,
      unrestricted: auth.kind === "anonymous" && auth.unrestricted,
    });
  }

  static effective(req: Request, res: Response): void {
    const auth = req.auth;
    if (auth.kind === "anonymous" && auth.unrestricted) {
      res.json({ unrestricted: true, keys: ALL_PERMISSION_KEYS });
      return;
    }
    if (auth.kind === "user") {
      res.json({ unrestricted: false, keys: auth.permissionKeys });
      return;
    }
    res.json({ unrestricted: false, keys: [] as string[] });
  }
}
