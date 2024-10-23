import { JwtPayload, sign, verify } from "jsonwebtoken"
import { User } from "../types/user.types"
import { NextFunction, Request, Response } from "express"
import { UserRoles } from "@prisma/client";

const TOKEN_SECRET = process.env.TOKEN_SECRET as string

interface AuthRequest extends Request {
	token: string | JwtPayload;
}

export const generateAcessToken = (user: User) => {
	return sign(
		{
			role: user.role,
			user: user.id
		},
		TOKEN_SECRET,
		{
			expiresIn: '3600s'
		}
	)
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers['authorization']
		const token = authHeader && authHeader.split(' ')[1]
		if (!token) {
			throw new Error();
		}
		const decoded = verify(token, TOKEN_SECRET);
		(req as AuthRequest).token = decoded;
		next()
	} catch (error) {
		res.status(401).json('Error while authenticating')
	}
}

export const checkAdminStatus = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = (req as AuthRequest).token as JwtPayload
		if (!user) {
			throw new Error();
		}
		if (user.role !== UserRoles.ADMIN) {
			return res.status(403).json({ error: 'User not authorized' });
		}
		next()
	} catch (error) {
		res.status(401).json('Error while authenticating')
	}
}