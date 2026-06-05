const UserModel =
    require('../models/utente.model');

async function getUsers(req, res) {

    try {

        const users =
            await UserModel.getAllUsers();

        res.json(users);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

module.exports = {
    getUsers
};