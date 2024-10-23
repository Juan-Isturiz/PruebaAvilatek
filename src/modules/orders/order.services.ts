import { OrderStatus } from "@prisma/client"
import { Order, OrderInput } from "../../types/order.types"
import { db } from "../../config/db.server"

/**
 * Fetches an order by its ID.
 * 
 * @param {number} id - The ID of the order to retrieve.
 * @returns {Promise<Order | Error>} A Promise resolving to the order object or an Error.
 */
export const getOrderById = async (id: number): Promise<Order | Error> => {
	try {
		const orderData = await db.order.findUniqueOrThrow({
			where: { id: id },
			include: {
				client: {
					select: {
						name: true,
						id: true,
						email: true,
						role: true,
						status: true
					}
				},
				OrderProducts: {
					include: {
						product: true
					}
				}
			}
		})
		return orderData
	} catch (error) {
		throw error
	}
}

/**
 * Fetches orders associated with a specific client.
 * 
 * @param {number} clientId - The ID of the client.
 * * @param {number} page - The page number that will be returned
 * @returns {Promise<Order[] | Error>} A Promise resolving to an array of orders or an Error.
 */
export const getOrderByClientId = async (clientId: number, page: number): Promise<Order[] | Error> => {
	try {
		if (isNaN(page)) {
			page = 1;
		}
		if (page <= 0) {
			throw new Error('Invalid page number')
		}
		const offset = (page - 1) * 10
		const orderData = await db.order.findMany({
			where: {
				clientId: clientId
			},
			include: {
				client: true,
				OrderProducts: {
					include: {
						product: true
					}
				}
			},
			skip: offset,
			take: 10,
			orderBy: [
				{
					createdAt: 'desc'
				}
			]
		})
		return orderData
	} catch (error) {
		throw error
	}
}

/**
 * Creates a new order.
 * 
 * @param {NewOrderInput} input - Data object containing client and product information.
 * @returns {Promise<Order | Error>} A Promise resolving to the created order object or an Error.
 */
export const createOrder = async (input: OrderInput): Promise<Order | Error> => {
	try {
		const { client, products } = input

		//validate product stock before order creation
		const stockAvailability = await Promise.all(
			products.map(async (product) => {

				const prodStock = await db.product.findUniqueOrThrow({ where: { id: product.productId } })
				if (product.quantity <= 0) { throw new Error(`Invalid quantity rom product ${prodStock.name}`) }
				return prodStock.stock - product.quantity >= 0
			})
		)
		if (stockAvailability.includes(false)) throw new Error('Insufficient stock of the desired product')

		//Create order
		const newOrder = await db.order.create({
			data: {
				clientId: client,
				OrderProducts: {
					create: products
				}
			},
			include: {
				OrderProducts: {
					include: {
						product: true
					}
				},
				client: true
			}
		})
		// Update products stock
		const updatedOrderProducts = await Promise.all(
			newOrder.OrderProducts.map(async (OrderProduct) => {
				const newStock = OrderProduct.product.stock - OrderProduct.quantity
				const newProductBalance = await db.product.update({
					where: { id: OrderProduct.productId },
					data: {
						stock: newStock,
						availability: (newStock > 0)
					}
				})
				OrderProduct.product = newProductBalance
				return OrderProduct
			})
		)
		newOrder.OrderProducts = updatedOrderProducts
		return newOrder
	} catch (error) {
		throw error
	}
}

/**
 * Updates the status of an order.
 * 
 * @param {number} id - The ID of the order to update.
 * @param {OrderStatus} status - The new status for the order.
 * @returns {Promise<Order | Error>} A Promise resolving to the updated order object or an Error.
 */
export const updateOrderStatus = async (id: number, status: OrderStatus): Promise<Order | Error> => {
	try {
		const updatedOrder = await db.order.update({
			data: {
				status: status
			},
			where: { id: id },
			include: {
				OrderProducts: {
					include: {
						product: true
					}
				},
				client: true
			}
		})
		return updatedOrder
	} catch (error) {
		throw error
	}
}