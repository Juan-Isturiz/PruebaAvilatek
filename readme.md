# AvilaTek Test REST API
Esta api tiene como fin evaluar mi rendimiento en la construcción de una API REST que se apegue a las mejores prácticas.

### Tecnologías usadas
Se usó la librería `express` para la construcción principal de las rutas porque presenta una forma rápida, sencilla y escalable de construir API REST.

Por otra parte, la API se hizo en `typescript` para tener un mejor manejo de tipos de datos y hacer más fácil el proceso de programación al estar al tanto de los errores sin necesidad de compilar.

Se usó `dotenv` para guardar las variables de entorno sin subirlas necesariamente a github (_en este caso se subirá igualmente con fines de evaluación_).

Para el almacenamiento de datos se hizo uso de `postgresql` por ser la herramienta con la que tenfo más experiencia als er una manejador de base de datos relacionales. Además de esto se uso como ORM `prisma` dadas las especificaciones de evaluación.

### Servicio de Usuario
Se generaron diversos inputs para el manejo de usuarios
| Endpoint                       | Descripción                                                                                                                                                                                      | Input                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `{api}/user/auth` (POST)       | Este endpoint recibe las credenciales de usuario en forma de objeto y le da acceso al usuario en caso de que sean correctas, retornando entonces el usuario loggeado y un token de autenticación | ```json: { email: string, password: string }```                        |
| `/{api}/user/sign-up` (POST)   | Crea un nuevo usuario. Recibe un objeto con los datos del usuario (correo electrónico, nombre, rol y contraseña).                                                                                | `json { email: string, name: string, role: string, password: string }` |
| `{api}/user/:id ` (PUT)        | Actualiza un usuario existente. Recibe el ID del usuario en la URL y un objeto con los datos a actualizar en el cuerpo de la petición. Requiere autenticación con token.                         | `json { // Datos a actualizar del usuario }`                           |
| `{api}/user/suspend/:id` (PUT) | Suspende a un usuario existente. Recibe el ID del usuario en la URL. Requiere autenticación con token.                                                                                           | Ningún parámetro en el cuerpo de la petición.                          |
| `{api}/user/active/:id` (PUT)  | Activa a un usuario previamente suspendido. Recibe el ID del usuario en la URL. Requiere autenticación con token.                                                                                | Ningún parámetro en el cuerpo de la petición.                          |
| `{api}/user/delete/:id` (PUT)  | Elimina (marca como eliminado) a un usuario existente. Recibe el ID del usuario en la URL. Requiere autenticación con token.                                                                     | Ningún parámetro en el cuerpo de la petición.                          |

Para la autenticación de usuario se hizo uso de la librería `jsonwebtoken` para el manejo de los JWT de forma segura haciendo uso de la librería `dotenv` para mantener las variables de entorno seguras. Además de esto se hizo uso de la librería `bcrypt` para el hashing de las contraseñas. En el hashing de las contraseñas se usaron 10 _saltrounds_ para asegurar la confidencialidad de las mismas

### Servicio de Productos
| Endpoint                                | Descripción                                                                                                                       | Input                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `{api}/products/available/:page?` (GET) | Obtiene una lista de todos los productos disponibles e implementa paginación con base en el URL.                                  | Ninguno                                                                                           |
| `{api}/products/:id` (GET)              | Obtiene los detalles de un producto específico por su ID.                                                                         | Ningún parámetro en el cuerpo de la petición.                                                     |
| `{api}/products` (POST)                 | Crea un nuevo producto. Recibe los datos del producto en el cuerpo de la petición.                                                | `json { name: string, description: string, price: number, stock: number, availability: boolean `} |
| `{api}/products/:id` (PUT)              | Actualiza los datos de un producto existente. Recibe el ID del producto en la URL y los nuevos datos en el cuerpo de la petición. | `json { name: string, description: string, price: number, stock: number, availability: boolean }` |
| `{api}/products/:id` (DELETE)           | Elimina un producto existente. Recibe el ID del producto en la URL.                                                               | Ningún parámetro en el cuerpo de la petición.                                                     |

### Servicio de Ordenes
| Endpoint                                | Descripción                                                                                                    | Input                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `{api}/orders/:id` (GET)                | Obtiene los detalles de un pedido específico por su ID.                                                        | Ningún parámetro en el cuerpo de la petición.                               |
| `{api}/orders/history/:id/:page?` (GET) | Obtiene el historial de pedidos de un cliente específico por su ID e implementa paginación con base en el URL. | Ningún parámetro en el cuerpo de la petición.                               |
| `{api}/orders` (POST)                   | Crea un nuevo pedido. Recibe el ID del cliente y un arreglo de productos en el cuerpo de la petición.          | `json { client: number, products: [{prudctId: number, quantity: number}] }` |
| `{api}/orders/process/:id` (PUT)        | Cambia el estado de un pedido a "PROCESSING". Recibe el ID del pedido en la URL.                               | Ningún parámetro en el cuerpo de la petición.                               |
| `{api}/orders/deliver/:id` (PUT)        | Cambia el estado de un pedido a "DELIVERING". Recibe el ID del pedido en la URL.                               | Ningún parámetro en el cuerpo de la petición.                               |
| `{api}/orders/complete/:id` (PUT)       | Cambia el estado de un pedido a "COMPLETED". Recibe el ID del pedido en la URL.                                | Ningún parámetro en el cuerpo de la petición.                               |
| `{api}/orders/cancel/:id` (PUT)         | Cambia el estado de un pedido a "CANCELED". Recibe el ID del pedido en la URL.                                 | Ningún parámetro en el cuerpo de la petición.                               |

### Esquema de Prisma
Se Hizo el esquema de `prisma` pensando en la escalabilidad del sistema y tomando en cuenta la adición de nuevos tipos de usuario entre otras cosas.
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String
  password  String
  role      UserRoles
  status    UserStatus @default(ACTIVE)
  lastLogin DateTime   @default(now())
  Order     Order[]
}

model Product {
  id            Int             @id @default(autoincrement())
  name          String
  description   String
  price         Float
  stock         Int             @default(0)
  availability  Boolean         @default(true)
  status        Boolean         @default(true)
  OrderProducts OrderProducts[]
}

model Order {
  id            Int             @id @default(autoincrement())
  createdAt     DateTime        @default(now())
  client        User            @relation(fields: [clientId], references: [id])
  clientId      Int
  status        OrderStatus     @default(PENDING)
  OrderProducts OrderProducts[]
}

model OrderProducts {
  product   Product @relation(fields: [productId], references: [id])
  productId Int
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   Int
  quantity  Int

  @@id([productId, orderId])
}

enum OrderStatus {
  PENDING
  PROCESSING
  DELIVERING
  COMPLETED
  CANCELED
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum UserRoles {
  ADMIN
  CLIENT
}

 ```
