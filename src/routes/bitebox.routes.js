import { createUser, deleteUser, getUserByID, getUsers, getUserByEmailAndPassword, updateUser } from '../controllers/user.controller.js';
import { createRestaurant, deleteRestaurant, getRestaurantByID, getRestaurants, getRestaurantsByNameAOCategory, updateRestaurant } from '../controllers/restaurant.controller.js';
import { getProducts, getProductByID, getProductsByRestNameAOCategory, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { getOrders, getOrderByID, getOrdersByFilters, getNotAcceptedOrders, createOrder, updateOrder, deleteOrder } from '../controllers/order.controller.js';
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
// Retrieves all restaurants
router.get('/restaurants/all', getRestaurants );
// Retrieve restaurant by ID
router.get('/restaurant/:restaurantId', getRestaurantByID );
// Retrieve restaurants by name or category (Uses query parameters instead of path parameters)
router.get('/restaurants', getRestaurantsByNameAOCategory );
// Creates a new restaurant
router.post('/restaurant', createRestaurant );
// Updates an existing restaurant
router.patch('/restaurant/:restaurantId', updateRestaurant );
// Deletes an existing restaurant
router.delete('/restaurant/:restaurantId', deleteRestaurant );

// Products' endpoints
// Retrieves all products
router.get('/products/all', getProducts );
// Retrieve product by ID
router.get('/product/:productId', getProductByID );
// Retrieve products by restaurant name or category (Uses query parameters instead of path parameters)
router.get('/products', getProductsByRestNameAOCategory );
// Creates a new product
router.post('/product', createProduct );
// Updates an existing product
router.patch('/product/:productId', updateProduct );
// Deletes an existing product
router.delete('/product/:productId', deleteProduct );

// Orders' endpoints
// Retrieves all orders
router.get('/orders/all', getOrders );
// Retrieve order by ID
router.get('/order/:orderId', getOrderByID );
// Retrieve orders by filters (Uses query parameters instead of path parameters)
router.get('/orders', getOrdersByFilters );
// Retrieve orders that have not been accepted yet
router.get('/orders/not-accepted', getNotAcceptedOrders );
// Creates a new order
router.post('/order', createOrder );
// Updates an existing order
router.patch('/order/:orderId', updateOrder );
// Deletes an existing order
router.delete('/order/:orderId', deleteOrder );

export default router;