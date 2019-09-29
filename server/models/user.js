'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    firstName: {
      type: DataTypes.STRING
    },
    status:{
    type: DataTypes.STRING},
    lastName: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isUnique(value, next) {
          let self = this;
          user.find({where: {email: value}})
          .then(function (thisuser) {
              // reject if a different user wants to use the same email
              if (thisuser && self.id !== thisuser.id) {
                  return next('Email already in use!');
              }
              return next();
          })
          .catch(function (err) {
              return next(err);
          });
        }
      }
    },
    
    password: {
      type: DataTypes.STRING
    },
    quickBlockID: {
      type: DataTypes.STRING
    },
    createrId: {
      type: DataTypes.BIGINT
    },
    userType: {
      type: DataTypes.ENUM,
      values: ['superAdmin', 'admin', 'doctor', 'assistant']
    },
    mobileNumber: {
      type: DataTypes.STRING,
      validate: {
        isUnique(value, next) {
          let number = value.toString();
          let self = this;
          user.find({where: {mobileNumber: number}})
            .then(function (thisuser) {
                // reject if a different user wants to use the same email
                if (thisuser && self.id !== thisuser.id) {
                    return next('Mobile already in use!');
                }
                return next();
            })
            .catch(function (err) {
                return next(err);
            });
        }
      }
    },
    locationRestriction: {
      type: DataTypes.BOOLEAN
    },
    clinicData: DataTypes.VIRTUAL,
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
  return user;
};