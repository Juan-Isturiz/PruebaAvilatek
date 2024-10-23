import { hash } from "bcrypt"

export const passwordHashing = async (password: string) => {
	const hashedPassword = await hash(password, 10)
	return hashedPassword
}