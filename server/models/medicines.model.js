'use strict';
module.exports = (sequelize, DataTypes) => {
    const MedicinesSchema = sequelize.define('medicines', {
        medicineName: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        dosageValue: {
            type: DataTypes.STRING
        },
        dosageType: {
            type: DataTypes.STRING
        },
        route: {
            type: DataTypes.STRING
        },

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
    return MedicinesSchema;
};