import express from "express";
import type { Request, Response } from "express";
import * as ProductService from "./product.services"
import { body, validationResult } from 'express-validator';
import { authenticateToken, checkAdminStatus } from "../../utils/token.utils";

export const productRouter = express.Router()

productRouter.get('/available/:page?', async (req: Request, res: Response) => {
	try {
		const page: number = parseInt(req.params.page, 10)
		const availableProducts = await ProductService.listAvailableProducts(page)

		return res.status(200).json(availableProducts)
	} catch (error: any) {
		return res.status(500).json(error.message);
	}
})

productRouter.get('/:id', async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10);
		const productSearch = await ProductService.getProductById(id);
		return res.status(200).json(productSearch);
	} catch (error: any) {
		return res.status(500).json(error.message);
	}
})

productRouter.post('/',
	authenticateToken,
	checkAdminStatus,
	body('name').isString(),
	body("description").isString(),
	body("price").isFloat(),
	body("stock").isInt().optional({ checkFalsy: true }),
	body("availability").isBoolean(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const input = req.body
			const newProduct = await ProductService.createProduct(input)
			return res.status(200).json(newProduct);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)

productRouter.put('/:id',
	authenticateToken,
	checkAdminStatus,
	body('name').isString().optional({ checkFalsy: true }),
	body("description").isString().optional({ checkFalsy: true }),
	body("price").isFloat().optional({ checkFalsy: true }),
	body("stock").isInt().optional({ checkFalsy: true }),
	body("availability").isBoolean().optional({ checkFalsy: true }),
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const input = req.body
			const updatedProduct = await ProductService.updateProduct(id, input)
			return res.status(200).json(updatedProduct);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	})

productRouter.delete('/:id',
	authenticateToken,
	checkAdminStatus,
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			await ProductService.deleteProduct(id)
			return res.status(200)
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	})