import Order from '../models/order.model';

export async function getOrders(req,res){
    try {
        const orders = await Order.find({isDeleted: false});
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
}

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
        const orders = await Order.find({ status: {$in:['Created', 'Sent']}, isDeleted: false });
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
    const { user, restaurant, products, total } = req.body;

    try {
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

export async function updateOrder(req, res) {
    const { orderId } = req.params;
    const { user, courier, restaurant, products, total, status } = req.body;

    try {
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
