import { JwtPayload, sign, verify } from "jsonwebtoken"
import { User } from "../types/user.types"
import { NextFunction, Request, Response } from "express"
import { UserRoles } from "@prisma/client";

// Retrieve the token secret from environment variables
const TOKEN_SECRET = process.env.TOKEN_SECRET as string

// Extend the Request interface to include a token property
interface AuthRequest extends Request {
	token: string | JwtPayload;
}

/**
 * Generates an access token for a given user.
 * @param user - The user for whom the token is generated.
 * @returns A signed JWT token.
 */
export const generateAcessToken = (user: User) => {
	return sign(
		{
			role: user.role, // Include user role in the token payload
			user: user.id    // Include user ID in the token payload
		},
		TOKEN_SECRET, // Use the secret to sign the token
		{
			expiresIn: '3600s' // Set token expiration time to 1 hour
		}
	)
}

/**
 * Middleware to authenticate a token.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	try {
		// Retrieve the authorization header from the request
		const authHeader = req.headers['authorization']
		// Extract the token from the header (format: "Bearer <token>")
		const token = authHeader && authHeader.split(' ')[1]
		if (!token) {
			// If no token is found, throw an error
			throw new Error();
		}
		// Verify the token using the secret
		const decoded = verify(token, TOKEN_SECRET);
		// Store the decoded token in the request object for future use
		(req as AuthRequest).token = decoded;
		next() // Proceed to the next middleware
	} catch (error) {
		// If authentication fails, respond with a 401 status
		res.status(401).json('Error while authenticating')
	}
}

/**
 * Middleware to check if the user has admin status.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const checkAdminStatus = (req: Request, res: Response, next: NextFunction) => {
	try {
		// Retrieve the user information from the decoded token
		const user = (req as AuthRequest).token as JwtPayload
		if (!user) {
			// If no user information is found, throw an error
			throw new Error();
		}
		// Check if the user role is ADMIN
		if (user.role !== UserRoles.ADMIN) {
			// If not, respond with a 403 status indicating forbidden access
			return res.status(403).json({ error: 'User  not authorized' });
		}
		next() // Proceed to the next middleware
	} catch (error) {
		// If an error occurs during authorization, respond with a 401 status
		res.status(401).json('Error while authenticating')
	}
}