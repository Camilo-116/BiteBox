
import Restaurant from '../models/restaurant.model';

export async function getRestaurantByID(req, res) {

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant || restaurant.isDeleted) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(200).json(restaurant);
}

export async function getRestaurantsByNameAOCategory(req, res) {
    const { name, category } = req.query;

    const query = { isDeleted: false };

    if (name) {
        query.name = { $regex: name, $options: 'i' };
    }

    if (category) {
        query.categories = { $elemMatch: { $eq: category } };
    }

    try {
        const restaurants = await Restaurant.find(query);
        res.status(200).json(restaurants);
        if (!restaurants) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function createRestaurant(req, res) {
    try {
        const { name, address,
            categories, admin } = req.body;
        const restaurant = new Restaurant({
            name,
            address,
            categories,
            admin
        });
        const result = await restaurant.save();
        res.status(200).json(result);
    } catch (err) {
        if (err.code == 11000) err.description = "Intended name is already registered by another restaurant.";
        res.status(500).json(err);
    }
}

export async function updateRestaurant(req, res) {
    const { restaurantId } = req.params;
    const { name, address, products,
        categories, admin } = req.body;
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'address', 'products', 'categories', 'admin'];
        const allowedFields = updates.reduce((allowed, update) => {
            if (!allowedUpdates.includes(update)) {
                allowed.push(update);
            }
            return allowed;
        }, []);
        for (const f in allowedFields) {
            console.log(`Field ${allowedFields[f]} won't be updated.`);
        }
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            { _id: restaurantId, isDeleted: false },
            {
                $set: {
                    name,
                    address,
                    products,
                    categories,
                    admin,
                    ...(products && { products }),
                },
            },
            { new: true, omitUndefined: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).send("Restaurant not found");
        }
        res.status(200).json(updatedRestaurant);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function deleteRestaurant(req, res) {
    const { restaurantId } = req.params;

    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { isDeleted: true },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({ message: `Restaurant ${restaurantId} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}