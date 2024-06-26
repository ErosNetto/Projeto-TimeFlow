const Scheduling = require("../models/Scheduling");
const TimeSlot = require("../models/TimeSlot");
const User = require("../models/User");
const Service = require("../models/Service");
const Professional = require("../models/Professional");
const Company = require("../models/Company");
const Message = require("../models/Message");

// Scheduling for the user
const userMakeScheduling = async (req, res) => {
  const { date, startTime, companyId, serviceId, professionalId } = req.body;
  const reqUser = req.user;

  try {
    const user = await User.findById(reqUser._id);
    const company = await Company.findById(companyId).select("-password");
    const professional = await Professional.findById(professionalId);

    if (!user || !company || !professional) {
      res.status(404).json({ errors: ["Recurso não encontrado."] });
      return;
    }

    if (!professional.companyId.equals(company._id)) {
      res.status(422).json({
        errors: ["O profissional não pertence à empresa especificada."],
      });
      return;
    }

    const existingTimeSlot = await TimeSlot.findOne({
      date,
      startTime,
      companyId: company._id,
      professionalId: professional._id,
    });

    if (existingTimeSlot) {
      return res.status(400).json({ error: "Esse horário está indisponivel!" });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      res.status(404).json({ errors: ["Serviço não encontrado."] });
      return;
    }

    if (!service.companyId.equals(company._id)) {
      res.status(422).json({
        errors: ["O serviço não pertence à empresa especificada."],
      });
      return;
    }

    // Create a timeSlot
    const newTimeSlot = await TimeSlot.create({
      date,
      startTime,
      companyId: company._id,
      professionalId: professional._id,
    });

    // If timeSlot was created successfully
    if (!newTimeSlot) {
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    // Create a scheduling
    const newScheduling = await Scheduling.create({
      userName: user.userName,
      date,
      startTime,
      userId: user._id,
      companyId: company._id,
      serviceId: service._id,
      professionalId: professional._id,
    });

    // If scheduling was created successfully
    if (!newScheduling) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    const newMessage = await Message.create({
      userName: user.userName,
      message: "Agendado",
      schedulingNewId: newScheduling._id,
      companyId: company._id,
    });

    // If message was created successfully
    if (!newMessage) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      await Scheduling.findByIdAndDelete(newScheduling._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    res
      .status(201)
      .json({ newScheduling, message: "Agendamento feito com sucesso!" });
  } catch (error) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
    return;
  }
};

// Rescheduling for the user
const userMakeRescheduling = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, professionalId, reason } = req.body;
  const reqUser = req.user;

  try {
    const scheduling = await Scheduling.findById(id);

    // Check if scheduling exists
    if (!scheduling) {
      res.status(404).json({ errors: ["Agendamento não encontrado!"] });
      return;
    }

    // Check if scheduling belongs to user
    if (!scheduling.userId.equals(reqUser._id)) {
      res.status(422).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    const existingTimeSlot = await TimeSlot.findOne({
      date,
      startTime,
      companyId: scheduling.companyId,
      professionalId,
    });

    if (existingTimeSlot) {
      return res.status(400).json({ error: "Esse horário está indisponivel!" });
    }

    const timeSlot = await TimeSlot.findOne({
      date: scheduling.date,
      startTime: scheduling.startTime,
      companyId: scheduling.companyId,
      professionalId: scheduling.professionalId,
    });

    // Check if timeSlot exists
    if (!timeSlot) {
      res.status(404).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    // Create a timeSlot
    const newTimeSlot = await TimeSlot.create({
      date,
      startTime,
      companyId: scheduling.companyId,
      professionalId,
    });

    // If timeSlot was created successfully
    if (!newTimeSlot) {
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    // Create a new scheduling
    const newScheduling = await Scheduling.create({
      userName: scheduling.userName,
      date,
      startTime,
      userId: reqUser._id,
      companyId: scheduling.companyId,
      serviceId: scheduling.serviceId,
      professionalId,
    });

    // If scheduling was created successfully
    if (!newScheduling) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    const newMessage = await Message.create({
      userName: scheduling.userName,
      message: "Reagendado",
      date: scheduling.date,
      startTime: scheduling.time,
      reason,
      schedulingNewId: newScheduling._id,
      companyId: scheduling.companyId,
    });

    // If message was created successfully
    if (!newMessage) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      await Scheduling.findByIdAndDelete(newScheduling._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    await TimeSlot.findByIdAndDelete(timeSlot._id);
    await Scheduling.findByIdAndDelete(id);

    res
      .status(201)
      .json({ newScheduling, message: "Reagendamento feito com sucesso!" });
  } catch (error) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
    return;
  }
};

// Scheduling for the company
const companyMakeScheduling = async (req, res) => {
  const { userName, date, startTime, serviceId, professionalId } = req.body;
  const reqCompany = req.company;

  try {
    const company = await Company.findById(reqCompany.id).select("-password");
    const professional = await Professional.findById(professionalId);

    if (!company || !professional) {
      res.status(404).json({ errors: ["Recurso não encontrado."] });
      return;
    }

    if (!professional.companyId.equals(company._id)) {
      res.status(422).json({
        errors: ["O profissional não pertence à empresa especificada."],
      });
      return;
    }

    const existingTimeSlot = await TimeSlot.findOne({
      date,
      startTime,
      companyId: company._id,
      professionalId: professional._id,
    });

    if (existingTimeSlot) {
      return res.status(400).json({ error: "Esse horário está indisponivel!" });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      res.status(404).json({ errors: ["Serviço não encontrado."] });
      return;
    }

    if (!service.companyId.equals(company._id)) {
      res.status(422).json({
        errors: ["O serviço não pertence à empresa especificada."],
      });
      return;
    }

    // Create a timeSlot
    const newTimeSlot = await TimeSlot.create({
      date,
      startTime,
      companyId: company._id,
      professionalId: professional._id,
    });

    // If timeSlot was created successfully
    if (!newTimeSlot) {
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    // Create a scheduling
    const newScheduling = await Scheduling.create({
      userName,
      date,
      startTime,
      companyId: company._id,
      serviceId: service._id,
      professionalId: professional._id,
    });

    // If scheduling was created successfully
    if (!newScheduling) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    res
      .status(201)
      .json({ newScheduling, message: "Agendamento feito com sucesso!" });
  } catch (error) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
    return;
  }
};

// Rescheduling for the company
const companyMakeRescheduling = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, professionalId } = req.body;
  const reqCompany = req.company;

  try {
    const scheduling = await Scheduling.findById(id);

    // Check if scheduling exists
    if (!scheduling) {
      res.status(404).json({ errors: ["Agendamento não encontrado!"] });
      return;
    }

    // Check if scheduling belongs to user
    if (!scheduling.companyId.equals(reqCompany._id)) {
      res.status(422).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    const existingTimeSlot = await TimeSlot.findOne({
      date,
      startTime,
      companyId: scheduling.companyId,
      professionalId,
    });

    if (existingTimeSlot) {
      return res.status(400).json({ error: "Esse horário está indisponivel!" });
    }

    const timeSlot = await TimeSlot.findOne({
      date: scheduling.date,
      startTime: scheduling.startTime,
      companyId: scheduling.companyId,
      professionalId: scheduling.professionalId,
    });

    // Check if timeSlot exists
    if (!timeSlot) {
      res.status(404).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    // Create a timeSlot
    const newTimeSlot = await TimeSlot.create({
      date,
      startTime,
      companyId: scheduling.companyId,
      professionalId,
    });

    // If timeSlot was created successfully
    if (!newTimeSlot) {
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    // Create a new scheduling
    const newScheduling = await Scheduling.create({
      userName: scheduling.userName,
      date,
      startTime,
      companyId: reqCompany._id,
      serviceId: scheduling.serviceId,
      professionalId,
    });

    // If scheduling was created successfully
    if (!newScheduling) {
      await TimeSlot.findByIdAndDelete(newTimeSlot._id);
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    await TimeSlot.findByIdAndDelete(timeSlot._id);
    await Scheduling.findByIdAndDelete(id);

    res
      .status(201)
      .json({ newScheduling, message: "Reagendamento feito com sucesso!" });
  } catch (error) {
    console.log(error);
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
    return;
  }
};

// Get all scheduling for company or user
const getAllScheduling = async (req, res) => {
  try {
    const scheduling = await Scheduling.find({
      $or: [
        req.company ? { companyId: req.company._id } : { userId: req.user._id },
      ],
    })
      .sort([["createdAt", -1]])
      .exec();

    if (scheduling.length === 0) {
      return res.status(200).json({
        scheduling,
        message: req.company
          ? "Sua empresa não possui nenhum agendamento!"
          : "Você não possui nenhum agendamento!",
      });
    }

    return res.status(200).json(scheduling);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
  }
};

// Get scheduling by id
const getSchedulingById = async (req, res) => {
  const { id } = req.params;

  try {
    const scheduling = await Scheduling.findById(id);

    // Check if professional exists
    if (!scheduling) {
      res.status(404).json({ errors: ["Agendamento não encontrado."] });
      return;
    }

    return res.status(200).json(scheduling);
  } catch (error) {
    res.status(404).json({ errors: ["Agendamento não encontrado."] });
    return;
  }
};

// Cancel scheduling
const cancelScheduling = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const scheduling = await Scheduling.findById(id);

    // Check if service exist
    if (!scheduling) {
      res.status(404).json({ errors: ["Agendamento não encontrado!"] });
      return;
    }

    // Check if scheduling belongs to company or user
    if (req.user) {
      if (!scheduling.userId.equals(req.user._id)) {
        res.status(422).json({
          erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
        });
        return;
      }
    } else {
      if (!scheduling.companyId.equals(req.company._id)) {
        res.status(422).json({
          erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
        });
        return;
      }
    }

    const timeSlot = await TimeSlot.findOne({
      date: scheduling.date,
      startTime: scheduling.startTime,
      companyId: scheduling.companyId,
      professionalId: scheduling.professionalId,
    });

    // Check if timeSlot exists
    if (!timeSlot) {
      res.status(404).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    const newMessage = await Message.create({
      userName: scheduling.userName,
      message: "Cancelado",
      date: scheduling.date,
      startTime: scheduling.time,
      reason,
      companyId: scheduling.companyId,
    });

    if (!newMessage) {
      res
        .status(422)
        .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
      return;
    }

    await Scheduling.findByIdAndDelete(scheduling._id);
    await TimeSlot.findByIdAndDelete(timeSlot._id);

    res.status(200).json({
      id: scheduling._id,
      message: "Agendamento excluido com sucesso.",
    });
  } catch (error) {
    res.status(404).json({ errors: ["Agendamento não encontrado!"] });
    return;
  }
};

module.exports = {
  userMakeScheduling,
  userMakeRescheduling,
  companyMakeScheduling,
  companyMakeRescheduling,
  getAllScheduling,
  getSchedulingById,
  cancelScheduling,
};
