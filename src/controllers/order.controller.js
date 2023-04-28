import Order from '../models/order.model';
import Product from '../models/product.model';
import User from '../models/user.model';

export async function getOrdersByFilters(req, res) {
    try {
        const { userId, courierId, restaurantName,
            startDate, endDate, populate } = req.query;

        const query = { isDeleted: false };

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

        const orders = (populate) ?
            await Order.find(query).populate('user').populate('courier') :
            await Order.find(query);

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function getNotAcceptedOrders(req, res) {
    try {
        const orders = await Order.find({ status: { $in: ['Created', 'Sent'] }, isDeleted: false });
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
    const { orderId, populate } = req.params;

    try {
        const order = (populate) ?
            await Order.findOne({ _id: orderId, isDeleted: false }).populate('user').populate('courier').populate('restaurant') :
            await Order.findOne({ _id: orderId, isDeleted: false });

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
    let { user, restaurant, products } = req.body;

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

        const order = new Order({
            user,
            restaurant,
            products,
            total
        });

        const result = await order.save();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function sendOrder(req, res) {
    const { orderId } = req.params;

    try {
        const sentOrder = await Order.findOneAndUpdate(
            { _id: orderId, isDeleted: false, status: 'Created' },
            { $set: { status: 'Sent' } },
            { new: true }
        );
        if (!sentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(sentOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function acceptOrder(req, res) {
    const { orderId, courierId } = req.params;

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
        res.status(200).json(acceptedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function nextStage(req, res) {
    const { orderId } = req.params;

    try {
        const order = await Order.findById({ _id: orderId, isDeleted: false });
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
            { _id: orderId, isDeleted: false, status: 'Created' },
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
            return res.status(404).send("Order not found");
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

        res.json({ message: `Order ${orderId} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}
