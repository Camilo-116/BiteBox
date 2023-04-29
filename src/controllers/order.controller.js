import Order from '../models/order.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import Restaurant from '../models/restaurant.model';
import { notifyUser } from '../helpers/notification.service';

export async function getOrdersByFilters(req, res) {

    const query = { isDeleted: false };

    if (Object.keys(req.query).length != 0) {
        const { userId, courierId, restaurantName,
            startDate, endDate } = req.query;

        if (userId) {
            query.user = userId;
        }

        if (courierId) {
            query.courier = courierId;
        }

        if (restaurantName) {
            query.restaurant = { $regex: restaurantName, $options: 'i' };
        }

        if (startDate && endDate) {
            query.createdAt = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            query.createdAt = { $gte: startDate };
        } else if (endDate) {
            query.createdAt = { $lte: endDate };
        }
    } else {
        if (Object.keys(req.params).length != 0) {
            if (!req.session.restaurants || !req.session.restaurants.includes(req.params.restaurantName)) return res.status(401).json({ error: 'Unauthorized' });
            query.restaurant = req.params.restaurantName;
            if (req.path.includes('on-going-orders')) {
                query.status = { $ne: 'Finished' };
            } else if (req.path.includes('finished-orders')) {
                query.status = 'Finished';
                switch (req.params.period) {
                    case "today":
                        query.createdAt = { $gte: new Date().setHours(0, 0, 0, 0) };
                        break;
                    case "lastWeek":
                        query.createdAt = { $gte: new Date().setDate(new Date().getDate() - 7) };
                        break;
                    case "lastMoth":
                        query.createdAt = { $gte: new Date().setMonth(new Date().getMonth() - 1) };
                        break;
                    default:
                        return res.status(400).json({ error: 'Invalid period' });
                }
            }
        }
    }


    try {

        const orders = await Order.find(query).populate('user', 'fullName address').populate('courier', 'fullName').populate('restaurant');

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function getNotAcceptedOrders(req, res) {

    let sort;
    switch (req.params.sortType) {
        case "distance-to-restaurant":
            sort = {
                $sort: {
                    distanceToRestaurant: 1
                }
            };
            break;
        case "client-to-restaurant":
            sort = {
                $sort: {
                    clientToRestaurant: 1
                }
            };
            break;
        case "order-date":
            sort = {
                $sort: {
                    createdAt: -1
                }
            };
            break;
        default:
            sort = {
                $sort: { createdAt: -1 }
            };
            break;
    };
    
    try {
        const orders = await Order.aggregate([
            {
                $match: { status: 'Sent', isDeleted: false }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: 'name',
                    as: 'restaurant'
                }
            },
            {
                $unwind: '$restaurant'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    user: {
                        fullName: 1,
                        address: 1
                    },
                    restaurant: {
                        name: 1,
                        address: 1
                    },
                    status: 1,
                    products: 1,
                    total: 1,
                    createdAt: 1
                }
            },
            {
                $addFields: {
                    distanceToRestaurant: {
                        $abs: {
                            $subtract: ["$restaurant.address", req.session.address]
                        }
                    },
                    clientToRestaurant: {
                        $abs: {
                            $subtract: ["$user.address", "$restaurant.address"]
                        }
                    }
                }
            },
            sort,
            {
                $project: {
                    clientToRestaurant: 0,
                    distanceToRestaurant: 0
                }
            }
        ]);
        if (!orders) {
            return res.status(404).json({ error: 'Orders not found' });
        }
        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function getOrderByID(req, res) {
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ _id: orderId, isDeleted: false }).populate('user').populate('courier').populate('restaurant');

        if (!order || order.isDeleted) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function createOrder(req, res) {
    let { restaurant, products } = req.body;

    try {
        products = await Promise.all(products.map(async (p) => {
            const product = await Product.findOne({ name: p.name, isDeleted: false });
            if (!product) {
                console.log(`Product ${p.name} not found, skipping...`);
                return null;
            } else {
                const t = product.price * p.quantity;
                return { ...p, total: t };
            }
        }));

        products = products.filter((p) => p !== null);

        const total = products.reduce((acc, p) => acc + p.total, 0);

        const orderRestaurant = await Restaurant.findOne({ name: restaurant, isDeleted: false });
        if (!orderRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const order = new Order({
            user: req.session.userId,
            restaurant,
            products,
            total
        });

        const newOrder = await order.save();
        res.status(200).json(newOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function sendOrder(req, res) {
    const { orderId } = req.params;

    try {
        const sentOrder = await Order.findOneAndUpdate(
            { _id: orderId, isDeleted: false, status: 'Created', user: req.session.userId },
            { $set: { status: 'Sent' } },
            { new: true }
        );
        if (!sentOrder) {
            return res.status(400).json({ error: 'Order not found or belongs to another user' });
        }
        const restaurantAfterOrder = await Restaurant.findOneAndUpdate(
            { name: sentOrder.restaurant, isDeleted: false },
            { $inc: { popularity: 1 } },
            { new: true }
        );
        console.log(`${sentOrder.restaurant} popularity increased to ${restaurantAfterOrder.popularity}.`)
        res.status(200).json(sentOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function acceptOrder(req, res) {
    const { orderId } = req.params;

    if (!req.session.userId || req.session.userType != 'courier') {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const courierId = req.session.userId

    try {
        const courier = await User.findOne({ _id: courierId, isDeleted: false });
        if (!courier || courier.userType !== 'courier') {
            return res.status(404).json({ error: 'Courier not found' });
        }
        const acceptedOrder = await Order.findOneAndUpdate(
            { _id: orderId, isDeleted: false, status: 'Sent' },
            { $set: { status: 'Accepted', courier: courierId } },
            { new: true }
        );
        if (!acceptedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        notifyUser({
            title: "Order accepted by courier",
            orderId: acceptedOrder._id,
            courier: `${courier.fullName.firstName} ${courier.fullName.lastNames}`,
        });
        res.status(200).json(acceptedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function nextStage(req, res) {
    const { orderId } = req.params;
    let newStatus;

    if (req.path.includes('received')) {
        if (!req.session.userId || req.session.userType != 'admin') {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        newStatus = 'Received';
    } else if (req.path.includes('arrived') || req.path.includes('finished')) {
        if (!req.session.userId || req.session.userType != 'courier') {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        newStatus = req.path.includes('arrived') ? 'Arrived' : 'Finished';
    }

    try {
        const order = await Order.findById({ _id: orderId, isDeleted: false }).populate('user').populate('courier');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const stages = ['Created', 'Sent', 'Accepted', 'Received', 'Arrived', 'Finished'];
        const nextStage = stages[stages.indexOf(order.status) + 1];
        if (!nextStage) {
            return res.status(400).json({ error: 'Order is already finished' });
        }
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, isDeleted: false },
            { $set: { status: nextStage } },
            { new: true }
        );
        switch (newStatus) {
            case "Received":
                notifyUser({
                    title: "Order picked up by courier",
                    orderId: updatedOrder._id,
                    courier: `${order.courier.fullName.firstName} ${order.courier.fullName.lastNames}`,
                    restaurant: order.restaurant,
                });
                break;
            case "Arrived":
                notifyUser({
                    title: "Courier arrived at destination",
                    courier: `${order.courier.fullName.firstName} ${order.courier.fullName.lastNames}`,
                    userAddress: order.user.address,
                });
                break;
            case "Finished":
                notifyUser({
                    title: "Order delivered",
                    orderId: updatedOrder._id,
                    user: `${order.user.fullName.firstName} ${order.user.fullName.lastNames}`,
                });
            default:
                break;
        }
        res.status(200).json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function updateOrder(req, res) {
    const { orderId } = req.params;
    const { user, courier, restaurant, status } = req.body;
    let { products } = req.body;

    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['user', 'courier', 'restaurant', 'products', 'status'];
        const allowedFields = updates.reduce((allowed, update) => {
            if (!allowedUpdates.includes(update)) {
                allowed.push(update);
            }
            return allowed;
        }, []);
        for (const f in allowedFields) {
            console.log(`Field ${allowedFields[f]} won't be updated.`);
        }

        products = await Promise.all(products.map(async (p) => {
            const product = await Product.findOne({ name: p.name, isDeleted: false });
            if (!product) {
                console.log(`Product ${p.name} not found, skipping...`);
                return null;
            } else {
                const t = product.price * p.quantity;
                return { ...p, total: t };
            }
        }));

        products = products.filter((p) => p !== null);

        const total = products.reduce((acc, p) => acc + p.total, 0);

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, isDeleted: false, status: 'Created', user: req.session.userId },
            {
                $set: {
                    user,
                    courier,
                    restaurant,
                    products,
                    total,
                    status
                }
            },
            { new: true, omitUndefined: true }
        );

        if (!updatedOrder) {
            return res.status(400).send("Order not found or belongs to another user");
        }

        res.status(200).json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function deleteOrder(req, res) {
    const { orderId } = req.params;

    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { isDeleted: true },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const restaurant = await Restaurant.findOneAndUpdate(
            { name: order.restaurant, isDeleted: false },
            { $inc: { popularity: -1 } },
            { new: true }
        );
        console.log(`${order.restaurant} popularity decreased to ${restaurant.popularity}.`)

        res.json({ message: `Order ${orderId} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}
