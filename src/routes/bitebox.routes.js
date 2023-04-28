import { createUser, deleteUser, getUserByID, getUsers, getUserByEmailAndPassword, updateUser } from '../controllers/user.controller.js';
import { createRestaurant, deleteRestaurant, getRestaurantByID, getRestaurants, getRestaurantsByNameAOCategory, updateRestaurant } from '../controllers/restaurant.controller.js';
import { getProducts, getProductByID, getProductsByRestNameAOCategory, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { getOrders, getOrderByID, getOrdersByFilters, getNotAcceptedOrders, createOrder, sendOrder, acceptOrder, nextStage, updateOrder, deleteOrder } from '../controllers/order.controller.js';
import {Router} from 'express';
const router = Router();

// Users' endpoints
// Retrieves all users
router.get('/users', getUsers );
// Retrieve user by ID
router.get('/user/:userId', getUserByID );
// Retrieve user by email and password (Uses query parameters instead of path parameters)
router.get('/user', getUserByEmailAndPassword );
// Creates a new user
router.post('/user', createUser );
// Updates an existing user
router.patch('/user/:userId', updateUser );
// Deletes an existing user
router.delete('/user/:userId', deleteUser );

// Restaurants' endpoints
// Retrieve restaurant by ID
router.get('/restaurant/:restaurantId', getRestaurantByID );
// Retrieve restaurants by name or category (Uses query parameters instead of path parameters)
// Can retrieve all restaurants if no query parameters are provided
router.get('/restaurants', getRestaurantsByNameAOCategory );
// Creates a new restaurant
router.post('/restaurant', createRestaurant );
// Updates an existing restaurant
router.patch('/restaurant/:restaurantId', updateRestaurant );
// Deletes an existing restaurant
router.delete('/restaurant/:restaurantId', deleteRestaurant );

// Products' endpoints
// Retrieve product by ID
router.get('/product/:productId', getProductByID );
// Retrieve products by restaurant name or category (Uses query parameters instead of path parameters)
// Can retrieve all products if no query parameters are provided
router.get('/products', getProductsByRestNameAOCategory );
// Creates a new product
router.post('/product', createProduct );
// Updates an existing product
router.patch('/product/:productId', updateProduct );
// Deletes an existing product
router.delete('/product/:productId', deleteProduct );

// Orders' endpoints
// Retrieve order by ID
router.get('/order/:orderId', getOrderByID );
// Retrieve orders by filters (Uses query parameters instead of path parameters)
// Can retrieve all orders if no query parameters are provided
router.get('/orders', getOrdersByFilters );
// Retrieve orders that have not been accepted yet
router.get('/orders/not-accepted', getNotAcceptedOrders );
// Creates a new order
router.post('/order', createOrder );
// Updates an existing order
router.patch('/order/:orderId', updateOrder );
// Sends a created order
router.patch('/order/:orderId/send', sendOrder );
// Accepts a sent order
router.patch('/order/:orderId/accept/:courierId', acceptOrder );
// Moves order to next stage
router.patch('/order/:orderId/next-stage', nextStage );
// Deletes an existing order
router.delete('/order/:orderId', deleteOrder );

export default router;