'use strict';
module.exports = (sequelize, DataTypes) => {
    var newPrescription = sequelize.define('newPrescription', {
        userId: {
            type: DataTypes.BIGINT
        },
        patientId: {
            type: DataTypes.BIGINT
        },
        clinicId: {
            type: DataTypes.BIGINT
        },
        doctorId: {
            type: DataTypes.BIGINT
        },
        lifeStyleInstructions: {
            type: DataTypes.STRING
        },
        // diagnosis: {
        //     type: DataTypes.STRING
        // },
        // additionalNote: {
        //     type: DataTypes.STRING
        // },
        // labSet: {
        //     type: DataTypes.STRING
        // },
        patientDetails: DataTypes.VIRTUAL,
        labSetDetails: DataTypes.VIRTUAL,

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
    return newPrescription;
};