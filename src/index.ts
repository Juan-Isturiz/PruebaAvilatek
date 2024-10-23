import express from "express"
import * as dotevnv from "dotenv"
import cors from "cors"
import { orderRouter } from "./modules/orders/order.routes"
import { productRouter } from "./modules/products/product.routes"
import { userRouter } from "./modules/users/user.routes"

dotevnv.config()

if (!process.env.PORT) {
    console.log(`No port value specified...`)
}

const PORT = parseInt(process.env.PORT as string, 10)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use("/order", orderRouter)
app.use("/product", productRouter)
app.use("/user", userRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})