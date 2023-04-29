import { createUser, deleteUser, getUserByID, getUsers, getUserByEmailAndPassword, updateUser } from '../controllers/user.controller.js';
import { createRestaurant, deleteRestaurant, getRestaurantByID, getRestaurantsByNameAOCategory, updateRestaurant } from '../controllers/restaurant.controller.js';
import { getProductByID, getProductsByRestNameAOCategory, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { getOrderByID, getOrdersByFilters, getNotAcceptedOrders, createOrder, sendOrder, acceptOrder, nextStage, updateOrder, deleteOrder } from '../controllers/order.controller.js';
import { logUserIn, logUserOut } from '../authentication/auth.service.js';

import { Router } from 'express';
const router = Router();

// Users' endpoints (No authentication required)
// Retrieves all users
router.get('/users', getUsers);
// Retrieve user by ID
router.get('/user/:userId', getUserByID);
// Retrieve user by email and password (Uses query parameters instead of path parameters)
router.get('/user', getUserByEmailAndPassword);
// Creates a new user
router.post('/user', createUser);
// Updates an existing user
router.patch('/user/:userId', updateUser);
// Deletes an existing user
router.delete('/user/:userId', deleteUser);

// Restaurants' endpoints (No authentication required)
// Retrieve restaurant by ID
router.get('/restaurant/:restaurantId', getRestaurantByID);
// Retrieve restaurants by name or category (Uses query parameters instead of path parameters)
// Can retrieve all restaurants if no query parameters are provided
router.get('/restaurants', getRestaurantsByNameAOCategory);
// Creates a new restaurant
router.post('/restaurant', createRestaurant);
// Updates an existing restaurant
router.patch('/restaurant/:restaurantId', updateRestaurant);
// Deletes an existing restaurant
router.delete('/restaurant/:restaurantId', deleteRestaurant);

// Products' endpoints
// Retrieve product by ID (No authentication required)
router.get('/product/:productId', getProductByID);
// Retrieve products by restaurant name or category (Uses query parameters instead of path parameters)
// Can retrieve all products if no query parameters are provided (No authentication required)
router.get('/products', getProductsByRestNameAOCategory);
// Creates a new product (Authentication required as product's restaurant admin)
router.post('/product', createProduct);
// Updates an existing product (Authentication required as product's restaurant admin)
router.patch('/product/:productId', updateProduct);
// Deletes an existing product (Authentication required as product's restaurant admin)
router.delete('/product/:productId', deleteProduct);

// Orders' endpoints
// Retrieve order by ID
router.get('/order/:orderId', getOrderByID);
// Retrieve orders by filters (Uses query parameters instead of path parameters)
// Can retrieve all orders if no query parameters are provided
router.get('/orders', getOrdersByFilters);
// Retrieve orders that have not been accepted yet (Has to be authenticated as courier)
router.get('/orders/not-accepted/:sortType', getNotAcceptedOrders);
// Creates a new order
router.post('/order', createOrder);
// Updates an existing order (Has to be authenticated as the user who created the order)
router.patch('/order/:orderId', updateOrder);
// Sends a created order (Has to be authenticated as the user who created the order)
router.patch('/order/:orderId/send', sendOrder);
// Accepts a sent order (Has to be authenticated as courier)
router.patch('/order/:orderId/accept', acceptOrder);
// Marks an order as Received (Has to be authenticated as admin)
router.patch('/order/:orderId/received', nextStage);
// Marks an order as Arrived (Has to be authenticated as courier)
router.patch('/order/:orderId/arrived', nextStage);
// Marks an order as Finished (Has to be authenticated as courier)
router.patch('/order/:orderId/finished', nextStage);
// Deletes an existing order (No authentication required)
router.delete('/order/:orderId', deleteOrder);

// Functional endpoints
// User login and save user's info in session
router.post('/login', logUserIn);
// User logout and destroy session
router.post('/logout', logUserOut);
// Restaurant admin get all products of one of his restaurants 
// (Has to be logged in and consulting one of his own restaurants, otherwise: Unauthorized)
router.get('/:restaurantName/inventory', getProductsByRestNameAOCategory);
// Restaurant admin get on-going orders of one of his restaurants
// (Has to be logged in and consulting one of his own restaurants, otherwise: Unauthorized)
router.get('/:restaurantName/on-going-orders', getOrdersByFilters);
// Restaurant admin get all finished orders of one of his restaurants within a period of time (today, this week, this month)
// (Has to be logged in and consulting one of his own restaurants, otherwise: Unauthorized)
router.get('/:restaurantName/finished-orders/:period', getOrdersByFilters);
// Retrieve products by restaurant name or category (Client view. Restaurant name goes in path params and doesn't use categories)
// Products are grouped by their categories
router.get('/:restaurantName/menu', getProductsByRestNameAOCategory);
export default router;