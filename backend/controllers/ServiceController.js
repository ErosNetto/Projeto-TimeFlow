const Service = require("../models/Service");
const Company = require("../models/Company");

// const mongoose = require("mongoose");

// Create a service, with an company related to it
const insertService = async (req, res) => {
  const { serviceName, price, time } = req.body;

  const reqCompany = req.company;

  const company = await Company.findById(reqCompany.id);

  // Create a service
  const newService = await Service.create({
    serviceName,
    price,
    time,
    companyId: company._id,
  });

  // If service was created successfully, return data
  if (!newService) {
    res.status(422).json({
      erros: ["Houve um problema, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json({ newService, message: "Serviço criado com sucesso!" });
};

// Update a service
const updateService = async (req, res) => {
  const { id } = req.params;
  const { serviceName, price, time } = req.body;

  const reqCompany = req.company;

  const service = await Service.findById(id);

  // Check if service exists
  if (!service) {
    res.status(404).json({ errors: ["Serviço não encontrado!"] });
    return;
  }

  // Check if service belongs to company
  if (!service.companyId.equals(reqCompany._id)) {
    res.status(422).json({
      erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  if (serviceName) {
    service.serviceName = serviceName;
  }

  if (price) {
    service.price = price;
  }

  if (time) {
    service.time = time;
  }

  await service.save();

  res.status(200).json({ service, message: "Serviço atualizado com sucesso!" });
};

// Remove a service from DB
const deleteService = async (req, res) => {
  const { id } = req.params;

  const reqCompany = req.company;

  try {
    // const service = await Service.findById(new mongoose.Types.ObjectId(id));
    const service = await Service.findById(id);

    // Check if service exist
    if (!service) {
      res.status(404).json({ errors: ["Serviço não encontrado!"] });
      return;
    }

    // Check if service belongs to company
    if (!service.companyId.equals(reqCompany._id)) {
      res.status(422).json({
        erros: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    await Service.findByIdAndDelete(service._id);

    res
      .status(200)
      .json({ id: service._id, message: "Serviço excluido com sucesso." });
  } catch (error) {
    res.status(404).json({ errors: ["Serviço não encontrado!"] });
    return;
  }
};

// Get service of company by id
const gelServicelById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findById(id);

    // Check if professional exists
    if (!service) {
      res.status(404).json({ errors: ["Serviço não encontrado."] });
      return;
    }

    return res.status(200).json(service);
  } catch (error) {
    res.status(404).json({ errors: ["Serviço não encontrado."] });
    return;
  }
};

// Get all company of services
const getCompanyServices = async (req, res) => {
  const reqCompany = req.company;

  if (!reqCompany) {
    return res.status(404).json({ message: "Empresa não encontrada" });
  }

  try {
    const companyServices = await Service.find({ companyId: reqCompany._id })
      .sort([["createdAt", -1]])
      .exec();

    if (companyServices.length === 0) {
      return res.status(200).json({
        companyServices,
        message: "Sua empresa não possui nenhum serviço!",
      });
    }

    return res.status(200).json(companyServices);
  } catch (error) {
    console.error("Erro ao buscar serviços da empresa:", error);
    return res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
  }
};

module.exports = {
  insertService,
  updateService,
  deleteService,
  gelServicelById,
  getCompanyServices,
};
