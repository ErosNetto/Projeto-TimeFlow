const { body } = require("express-validator");

const userCreateValidation = () => {
  return [
    body("userName")
      .isString()
      .withMessage("O nome é obrigatório.")
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 3 caracteres."),
    body("email")
      .isString()
      .withMessage("O e-mail é obrigatório.")
      .isEmail()
      .withMessage("Insira um e-mail válido."),
    body("telephone")
      .isString()
      .withMessage("O telefone é obrigatório.")
      .matches(/^\+\d{2} \d{2} \d{5}-\d{4}$/)
      .withMessage("O telefone deve estar no formato +XX XX XXXXX-XXXX."),
    body("password")
      .isString()
      .withMessage("A senha é obrigatória.")
      .isLength({ min: 8 })
      .withMessage("A senha precisa ter no mínimo 8 caracteres."),
    body("confirmPassword")
      .isString()
      .withMessage("A confirmação de senha é obrigatória.")
      .custom((value, { req }) => {
        if (value != req.body.password) {
          throw new Error("As senhas não são iguais.");
        }
        return true;
      }),
  ];
};

const userLoginValidation = () => {
  return [
    body("email")
      .isString()
      .withMessage("O e-mail é obrigatório.")
      .isEmail()
      .withMessage("Insira um e-mail válido."),
    body("password").isString().withMessage("A senha é obrigatória."),
  ];
};

const userUpdateValidation = () => {
  return [
    body("userName")
      .optional()
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 3 caracteres."),
    body("telephone")
      .optional()
      .matches(/^\+\d{2} \d{2} \d{5}-\d{4}$/)
      .withMessage("O telefone deve estar no formato +XX XX XXXXX-XXXX."),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("A senha precisa ter no mínimo 8 caracteres."),
  ];
};

module.exports = {
  userCreateValidation,
  userLoginValidation,
  userUpdateValidation,
};
