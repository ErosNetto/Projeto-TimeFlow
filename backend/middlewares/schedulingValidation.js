const { body } = require("express-validator");

const userMakeScheduleValidation = () => {
  return [
    body("date")
      .isISO8601()
      .withMessage("A data é obrigatória.")
      .custom((value) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        selectedDate.setUTCHours(0, 0, 0, 0);
        currentDate.setUTCHours(0, 0, 0, 0);
        return selectedDate >= currentDate;
      })
      .withMessage("A data selecionada deve ser hoje ou uma data futura."),
    body("startTime")
      .isString()
      .withMessage("O horário do agendamento é obrigatório."),
    body("companyId").isString().withMessage("O companyId é obrigatório."),
    body("serviceId").isString().withMessage("O serviceId é obrigatório."),
    body("professionalId")
      .isString()
      .withMessage("O professionalId é obrigatório."),
  ];
};

const makeReschedulingValidation = () => {
  return [
    body("date")
      .isISO8601()
      .withMessage("A data é obrigatória.")
      .custom((value) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        selectedDate.setUTCHours(0, 0, 0, 0);
        currentDate.setUTCHours(0, 0, 0, 0);
        return selectedDate >= currentDate;
      })
      .withMessage("A data selecionada deve ser hoje ou uma data futura."),
    body("startTime")
      .isString()
      .withMessage("O horário do agendamento é obrigatório."),
    body("reason")
      .if((value, { req }) => !!req.user)
      .isString()
      .withMessage("A razão do cancelamento é obrigatório.")
      .isLength({ min: 10 })
      .withMessage("A razão deve ter no mínimo 10 caracteres.")
      .isLength({ max: 100 })
      .withMessage("A razão deve ter no máximo 100 caracteres."),
  ];
};

const companyMakeScheduleValidation = () => {
  return [
    body("userName")
      .isString()
      .withMessage("O nome do cliente é obrigatório.")
      .isLength({ min: 3 })
      .withMessage("O nome do cliente precisa ser ter no mínimo 3 caracteres."),
    body("date")
      .isISO8601()
      .withMessage("A data é obrigatória.")
      .custom((value) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        selectedDate.setUTCHours(0, 0, 0, 0);
        currentDate.setUTCHours(0, 0, 0, 0);
        return selectedDate >= currentDate;
      })
      .withMessage("A data selecionada deve ser hoje ou uma data futura."),
    body("startTime")
      .isString()
      .withMessage("O horário do agendamento é obrigatório."),
    body("serviceId").isString().withMessage("O serviceId é obrigatório."),
    body("professionalId")
      .isString()
      .withMessage("O professionalId é obrigatório."),
  ];
};

const cancelSchedulingValidation = () => {
  return [
    body("reason")
      .if((value, { req }) => !!req.user)
      .notEmpty()
      .withMessage("A razão do cancelamento é obrigatório.")
      .isLength({ min: 10 })
      .withMessage("A razão deve ter no mínimo 10 caracteres.")
      .isLength({ max: 100 })
      .withMessage("A razão deve ter no máximo 100 caracteres."),
  ];
};

module.exports = {
  userMakeScheduleValidation,
  makeReschedulingValidation,
  companyMakeScheduleValidation,
  cancelSchedulingValidation,
};
