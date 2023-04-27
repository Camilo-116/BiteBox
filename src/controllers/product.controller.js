import Product from '../models/product.model';
import Restaurant from '../models/restaurant.model';

export async function createProduct(req, res) {
    try {
        const { name, description, price, category, restaurant } = req.body;

        const product = new Product({
            name,
            description,
            price,
            category,
            restaurant,
        });
        const newProduct = await product.save();

        // Add the product to the restaurant's list of products
        if (restaurant) {
            const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { name: restaurant },
                {
                    $push: {
                        products: product.name,
                    },
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                await Product.deleteOne({ _id: newProduct._id });
                return res.status(404).send("Restaurant not found");
            }
        }
        res.status(200).json(newProduct);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function getProducts(req, res) {
    try {
        const products = await Product.find({ isDeleted: false });
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function getProductByID(req, res) {
    const product = await Product.findById(req.params.productId);
    if (!product || product.isDeleted) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
}

export async function getProductsByRestNameAOCategory(req, res) {
    const { restaurantName, category } = req.query;
    const query = { isDeleted: false };

    if (restaurantName) {
        query.restaurant = restaurantName;
    }
    if (category) {
        query.category = category;
    }
    try {
        const products = await Product.find(query);
        if (!products) {
            return res.status(404).json({ error: 'No products found' });
        }
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

export async function updateProduct(req, res) {
    const { productId } = req.params;
    const { name, description, price, category } = req.body;
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            {
                $set: {
                    name,
                    description,
                    price,
                    category
                },
            },
            { new: true, omitUndefined: true }
        );

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }

        // Update the product's name in the restaurant's list of products
        // if it was one of the changes done
        if (name) {
            const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { name: updatedProduct.restaurant, isDeleted: false },
                {
                    $set: {
                        "products.$[element]": name,
                    },
                },
                {
                    arrayFilters: [{ "element": updatedProduct.name }],
                    new: true
                }
            );

            if (!updatedRestaurant) {
                return res.status(404).send("Related restaurant not found");
            }
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function deleteProduct(req, res) {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndUpdate(productId, { isDeleted: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove the product from the restaurant's list of products
        if (product.restaurant) {
            const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { name: product.restaurant, isDeleted: false },
                {
                    $pull: {
                        products: product.name,
                    },
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                return res.status(404).send("Related restaurant not found");
            }
        }

        res.json({ message: `Product ${productId} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}
