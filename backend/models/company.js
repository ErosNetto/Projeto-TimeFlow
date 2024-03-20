const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    companyName: String,
    ownerName: String,
    telephone: String,
    category: String,
    schedules: Object, // PUT
    address: Object, // PUT
    email: String,
    password: String,
    // companyExists: String,
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;

/*
address {
  road: 'String',
  district: 'String',
  city: 'String',
  state: 'String',
  zipCode: 'String',
}

schedules = {
  Domingo: "Fechado",
  SegundaFeira: "10:00 - 19:00",
  TerçaFeira: "10:00 - 19:00",
  QuartaFeira: "10:00 - 19:00",
  QuintaFeira: "10:00 - 19:00",
  SextaFeira: "10:00 - 19:00",
  Sábado: "10:00 - 17:00",
};
*/
