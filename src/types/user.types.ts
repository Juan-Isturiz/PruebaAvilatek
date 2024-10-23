import { UserRoles } from "@prisma/client";

export type User = {
	id: number;
	email: string;
	name: string;
	role: UserRoles;
};
export type UserInput = {
	email: string;
	name: string;
	role: UserRoles;
	password: string;
}