import { OrderStatus } from "@prisma/client"
import { Product } from "./product.type"
import { User } from "./user.types"

export type Order = {
	id: number
	createdAt: Date
	client: User
	OrderProducts: OrderProducts[]
	status: OrderStatus
}
export type OrderProducts = {
	product: Product
	quantity: number
}

export type OrderInput = {
	client: number;
	products: {
		productId: number;
		quantity: number;
	}[]
}