import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import * as UserService from "./user.services"
import { authenticateToken, checkAdminStatus } from "../../utils/token.utils";
import { UserStatus } from "@prisma/client";

export const userRouter = express.Router()

userRouter.post('/auth',
	body("email").isEmail(),
	body("password").isString(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		try {
			const { email, password } = req.body;
			const logInResponse = await UserService.logIn(email, password);
			res.status(200).json(logInResponse)
		} catch (error: any) {
			res.status(500).json(error.message);
		}
	}
)
userRouter.post('/sign-up',
	body("email").isEmail(),
	body("name").isString(),
	body("role").isString(),
	body("password").isString(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		try {
			const input = req.body
			const newUser = UserService.signUp(input);
			res.status(200).json(newUser);
		} catch (error: any) {
			res.status(500).json(error.message);
		}
	}
)

userRouter.put('/:id',
	authenticateToken,
	body("email").isEmail().optional({ values: "falsy" }),
	body("name").isString().optional({ values: "falsy" }),
	body("role").isString().optional({ values: "falsy" }),
	body("password").isString().optional({ values: "falsy" }),
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const input = req.body
			const updatedUser = await UserService.updateUser(id, input);
			res.status(200).json(updatedUser);
		} catch (error: any) {
			res.status(500).json(error.message);
		}
	},
)

userRouter.put('/suspend/:id', authenticateToken, checkAdminStatus, async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10)
		const updatedUser = await UserService.changeUserStatus(id, UserStatus.SUSPENDED)
		res.status(200).json(updatedUser);
	} catch (error: any) {
		res.status(500).json(error.message);
	}
})
userRouter.put('/active/:id', authenticateToken, checkAdminStatus, async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10)
		const updatedUser = await UserService.changeUserStatus(id, UserStatus.ACTIVE)
		res.status(200).json(updatedUser);
	} catch (error: any) {
		res.status(500).json(error.message);
	}
})
userRouter.put('/delete/:id', authenticateToken, checkAdminStatus, async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10)
		const updatedUser = await UserService.changeUserStatus(id, UserStatus.DELETED)
		res.status(200).json(updatedUser);
	} catch (error: any) {
		res.status(500).json(error.message);
	}
})