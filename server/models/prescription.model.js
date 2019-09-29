'use strict';
module.exports = (sequelize, DataTypes) => {
    var prescription = sequelize.define('prescription', {
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
        extraRemarks: {
            type: DataTypes.STRING
        },
        lifeStyleInstructions: {
            type: DataTypes.STRING
        },
        diagnosis: {
            type: DataTypes.STRING
        },
        additionalNote: {
            type: DataTypes.STRING
        },
        labSet: {
            type: DataTypes.STRING
        },
        patientDetails: DataTypes.VIRTUAL,
        patientHistory:DataTypes.VIRTUAL,
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
    return prescription;
};