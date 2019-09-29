'use strict';
module.exports = (sequelize, DataTypes) => {
    var prescriptionMedicine = sequelize.define('prescriptionMedicine', {
        prescriptionId: {
            type: DataTypes.BIGINT
        },
        userId: {
            type: DataTypes.BIGINT
        },
        patientId: {
            type: DataTypes.BIGINT
        },
        clinicId: {
            type: DataTypes.BIGINT
        },
        medicineId: {
            type: DataTypes.BIGINT
        },
        medicineName: {
            type: DataTypes.STRING
        },
        dose: {
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW
        },
        frequency: {
            type: DataTypes.STRING
        },
        duration: {
            type: DataTypes.STRING
        },
        route: {
            type: DataTypes.STRING
        },
        quantity: {
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
    return prescriptionMedicine;
};