
import User from '../models/user.model';

export async function getUserbyID(req, res) {

    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
}

export async function getUserByEmailAndPassword(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email, password: password });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
}

export async function createUser(req, res) {
    try {
        const { firstName, middleNames, lastNames,
            email, password, phone,
            address, userType
        } = req.body;
        const user = new User({
            fullName: { firstName, middleNames, lastNames },
            email,
            password,
            phone,
            address,
            userType
        });
        const result = await user.save();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function updateUser(req, res) {
    const { userId } = req.params;
    const { firstName, middleNames, lastNames,
        email, password, phone,
        address, userType, restaurants } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    fullName: {
                        firstName,
                        middleNames,
                        lastNames,
                    },
                    email,
                    password,
                    phone,
                    address,
                    userType,
                    ...(restaurants && { restaurants }),
                },
            },
            { new: true, omitUndefined: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function deleteUser(req, res) {
    const { userId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(userId, { isDeleted: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: `User ${userId} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}