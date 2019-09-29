'use strict';
module.exports = (sequelize, DataTypes) => {
    var prescriptionComplaint = sequelize.define('prescriptionComplaint', {
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
        complaints: {
            type: DataTypes.STRING
        },
        duration: {
            type: DataTypes.STRING
        },
        period: {
            type: DataTypes.STRING
        },
        details: {
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
    return prescriptionComplaint;
};