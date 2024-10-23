import { Product, ProductInput } from './../../types/product.type';

import { db } from "../../config/db.server"

/**
 * Creates a new product.
 *
 * @param {NewProductInput} input - The data for the new product.
 * @returns {Promise<Product | Error>} A Promise resolving to the created product or an Error.
 */
export const createProduct = async (input: ProductInput): Promise<Product | Error> => {
	try {
		if (input.stock) {
			if (input.stock < 0) throw new Error('Invalid stock value: ' + input.stock)
		}
		if (input.price <= 0) throw new Error('Invalid price value: ' + input.price)
		const newProduct = await db.product.create({
			data: input
		})
		return newProduct
	} catch (error) {
		throw error
	}

}

/**
 * Lists all available products.
 * @param {number} page - The page number that will be returned
 * @returns {Promise<Product[] | Error>} A Promise resolving to an array of available products or an Error.
 */
export const listAvailableProducts = async (page: number = 1): Promise<Product[] | Error> => {
	try {
		if (isNaN(page)) {
			page = 1;
		}
		if (page <= 0) {
			throw new Error('Invalid page number')
		}
		const offset = (page - 1) * 10
		const productList = await db.product.findMany({
			where: { availability: true },
			skip: offset,
			take: 10

		})
		return productList
	} catch (error) {
		throw error
	}
}

/**
 * Gets a product by its ID.
 *
 * @param {number} id - The ID of the product.
 * @returns {Promise<Product | Error>} A Promise resolving to the found product or an Error.
 */
export const getProductById = async (id: number): Promise<Product | Error> => {
	try {
		const product = db.product.findUniqueOrThrow({
			where: { id: id }
		})
		return product

	} catch (error) {
		throw error
	}
}

/**
 * Updates a product by its ID.
 *
 * @param {number} id - The ID of the product to update.
 * @param {UpdateProductInput} data - The updated product data.
 * @returns {Promise<Product | Error>} A Promise resolving to the updated product or an Error.
 */
export const updateProduct = async (id: number, data: Partial<ProductInput>): Promise<Product | Error> => {
	try {
		if (data.price) {
			if (data.price <= 0) throw new Error('Invalid price setting');
		}
		if (data.stock) {
			if (data.stock < 0) throw new Error('Invalid price setting');
		}
		const updatedProduct = await db.product.update({
			where: { id: id },
			data: data
		})
		return updatedProduct
	} catch (error) {
		throw error
	}
}

/**
 * Deletes a product by its ID.
 *
 * @param {number} id - The ID of the product to delete.
 */
export const deleteProduct = async (id: number) => {
	try {
		await db.product.update({
			data: { status: false },
			where: { id: id }
		})
	} catch (error) {
		throw error
	}
}