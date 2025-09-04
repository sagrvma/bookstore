import { Router } from "express";
import { login, register } from "../controllers/authController";

const router = Router();

//POST - /api/auth/register - Register a new user
router.post("/register", register);
//POST - /api/auth/login - Login an existing user
router.post("/login", login); //POST for login as well since it just doesnt fetch data, but makes changes as well for e.g creates JWT token, changes server state by authentication. Also using GET is not safe as then the password and email will be exposed in the emails or logs, also might be cached in the browser.
export default router;
