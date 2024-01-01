const { body } = require("express-validator");


const userRegisterValidator = [
    body('Username')
        .exists({ checkFalsy: true })
        .withMessage('Username is required')
        .isString()
        .withMessage('Username should be a string'),

    body('Password')
        .exists()
        .withMessage('Password is required')
        .isStrongPassword({
            minLength: 8,
            maxLength:20,
            minLowercase: 1,
            minNumbers: 1,
            returnScore: true,
            pointsPerUnique: 1,
            pointsPerRepeat: 0.5,
            pointsForContainingLower: 10,
            pointsForContainingUpper: 10,
            pointsForContainingNumber: 10,
            pointsForContainingSymbol: 10
        })
        .withMessage('Use strong password'),

    body('ConfirmPassword')
        .exists()
        .withMessage('Confirmation password is required')
        .custom((value, { req }) => {
            if (value !== req.body.Password) {
                throw new Error('Password and confirmation password do not match');
            }
            return true;
        }),

    body('Email')
        .exists({ checkFalsy: true })
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Provide a valid email'),

    body('Name')
        .exists({ checkFalsy: true })
        .withMessage('Name is required')
        .isString()
        .withMessage('Name should be a string'),
];

module.exports = { userRegisterValidator };
