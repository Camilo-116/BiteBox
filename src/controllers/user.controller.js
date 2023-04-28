
import User from '../models/user.model';

export async function getUsers(req, res) {
    try {
        const users = await User.find({ isDeleted: false });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function getUserByID(req, res) {

    const user = await User.findById(req.params.userId);

    if (!user || user.isDeleted) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
}

export async function getUserByEmailAndPassword(req, res) {
    const { email, password } = req.query;
    const user = await User.findOne({ email: email, password: password, isDeleted: false });
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
        const newUser = await user.save();
        console.log(newUser);
        res.status(200).json(newUser);

    } catch (err) {
        if (err.code == 11000) err.description = "Intended email is already in use.";
        res.status(500).json(err);
    }
}

export async function updateUser(req, res) {
    const { userId } = req.params;
    const { firstName, middleNames, lastNames,
        email, password, phone,
        address, userType, restaurants } = req.body;
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'middleNames', 'lastNames',
            'email', 'password', 'phone',
            'address', 'userType', 'restaurants'];
        const allowedFields = updates.reduce((allowed, update) => {
            if (!allowedUpdates.includes(update)) {
                allowed.push(update);
            }
            return allowed;
        }, []);
        for (const f in allowedFields) {
            console.log(`Field ${allowedFields[f]} won't be updated.`);
        }
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            {
                $set: {
                    'fullName.firstName': firstName,
                    'fullName.middleNames': middleNames,
                    'fullName.lastNames': lastNames,
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