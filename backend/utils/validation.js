const { body, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  body('usn')
    .trim()
    .notEmpty()
    .withMessage('USN is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .trim()
    .custom((value) => {
      // Remove any non-digit characters and check length
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length === 10 || digitsOnly.length === 12) {
        return true;
      }
      throw new Error('Phone number must be 10 or 12 digits');
    })
    .withMessage('Phone number must be 10 or 12 digits'),

  body('branch')
    .notEmpty()
    .withMessage('Branch is required'),

  body('section')
    .notEmpty()
    .withMessage('Section is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

module.exports = { registerValidation, loginValidation };
