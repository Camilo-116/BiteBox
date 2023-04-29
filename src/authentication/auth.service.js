import { queryUserByEmailAndPassword } from '../controllers/user.controller.js';

export async function logUserIn(req, res) {
    const { email, password } = req.body;
    try {
        const user = await queryUserByEmailAndPassword(email, password);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.session.userId = user._id;
        req.session.fullName = user.fullName;
        req.session.email = user.email;
        req.session.userType = user.userType;
        req.session.address = user.address;
        req.session.phone = user.phone;
        req.session.restaurants = user.restaurants;
        const session = {...req.session};
        delete session.cookie;
        res.status(200).json(session);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
}

export async function logUserOut(req, res) {
    try {
        req.session.destroy();
        res.status(200).json({ message: 'User logged out' });
    } catch (error) {
        res.status(500).json(error);
    }
}