import express from "express";
import type { Request, Response } from "express";
import * as OrderService from "./order.services"
import { body, validationResult } from 'express-validator';
import { authenticateToken, checkAdminStatus } from "../../utils/token.utils";
import { OrderStatus } from "@prisma/client";

export const orderRouter = express.Router()

orderRouter.get('/:id', authenticateToken, async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10);
		const order = await OrderService.getOrderById(id);
		if (order) {
			return res.status(200).json(order);
		}
	} catch (err: any) {
		return res.status(500).json(err.message);
	}
})

orderRouter.get('/history/:id/:page?', authenticateToken, async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10);
		const page: number = parseInt(req.params.page, 10)
		const order = await OrderService.getOrderByClientId(id, page);
		if (order) {
			return res.status(200).json(order);
		}
	} catch (err: any) {
		return res.status(500).json(err.message);
	}
})

orderRouter.post(
	'/',
	authenticateToken,
	body("client").isInt(),
	body("products").isArray(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const input = req.body
			const newOrder = await OrderService.createOrder(input);
			if (newOrder) {
				return res.status(200).json(newOrder);
			}
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)

orderRouter.put(
	'/process/:id',
	authenticateToken,
	checkAdminStatus,
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const updatedOrder = await OrderService.updateOrderStatus(id, OrderStatus.PROCESSING);
			return res.status(200).json(updatedOrder);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)
orderRouter.put('/deliver/:id',
	authenticateToken,
	checkAdminStatus,
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const updatedOrder = await OrderService.updateOrderStatus(id, OrderStatus.DELIVERING);
			return res.status(200).json(updatedOrder);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)
orderRouter.put('/complete/:id',
	authenticateToken,
	checkAdminStatus,
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const updatedOrder = await OrderService.updateOrderStatus(id, OrderStatus.COMPLETED);
			return res.status(200).json(updatedOrder);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)
orderRouter.put(
	'/cancel/:id',
	authenticateToken,
	checkAdminStatus,
	async (req: Request, res: Response) => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const updatedOrder = await OrderService.updateOrderStatus(id, OrderStatus.CANCELED);
			return res.status(200).json(updatedOrder);
		} catch (error: any) {
			return res.status(500).json(error.message);
		}
	}
)