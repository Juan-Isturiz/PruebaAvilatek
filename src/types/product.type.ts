export type Product = {
	id: number,
	name: string,
	description: string,
	price: number,
	stock: number,
	availability: boolean,
	status: boolean,
}

export type ProductInput = {
	name: string,
	description: string,
	price: number,
	stock: number,
	availability: boolean,
	status: boolean,
};