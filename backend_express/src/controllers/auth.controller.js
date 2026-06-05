const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const UserModel =
    require('../models/utente.model');

async function register(req, res) {

    try {

        const {
            email,
            password,
            ruolo
        } = req.body;

        const existingUser =
            await UserModel.findUserByEmail(email);

        if (existingUser) {

            return res.status(400).json({
                error: 'Utente già esistente'
            });

        }

        const password_hash =
            await bcrypt.hash(password, 10);

        const result =
            await UserModel.createUser(
                email,
                password_hash,
                ruolo
            );

        res.status(201).json({

            message: 'Utente registrato',

            id: result.insertId

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
            await UserModel.findUserByEmail(email);

        if (!user) {

            return res.status(401).json({
                error: 'Credenziali non valide'
            });

        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!validPassword) {

            return res.status(401).json({
                error: 'Credenziali non valide'
            });

        }

        const token = jwt.sign(

            {
                id: user.id,
                ruolo: user.ruolo
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '24h'
            }

        );

        res.json({

            message: 'Login effettuato',

            token

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

module.exports = {
    register,
    login
};