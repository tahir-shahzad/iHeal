'use strict';
module.exports = (sequelize, DataTypes) => {
  const PatientSchema = sequelize.define('patient', {
    title: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING
    },
    middleName: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    lastName: {
      type: DataTypes.STRING
    },
    primaryMobileNumber: {
      type: DataTypes.STRING, 
      validate: {
        isUnique(value, next) {
          let number = value.toString();
          let self = this;
          PatientSchema.find({where: {primaryMobileNumber: number}})
            .then(function (thispatient) {
                // reject if a different user wants to use the same email
                if (thispatient && self.id != thispatient.id) {
                  return next('errors.primaryMobileNumber.unique');
                }
                return next();
            })
            .catch(function (err) {
                return next(err);
            });
          // patient.find({
          //   where: {
          //     primaryMobileNumber: value
          //   },
          //   attributes: ['id']
          // }).done((patient) => {
          //   if (patient)
          //     return next('errors.primaryMobileNumber.unique');

          //   next();
          // });
        }
      }
    },
    gender: {
      type: DataTypes.STRING
    },
    dateBirth: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    age: {
      type: DataTypes.STRING
    },
    clinicname: DataTypes.VIRTUAL,

    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  });
  return PatientSchema;
};