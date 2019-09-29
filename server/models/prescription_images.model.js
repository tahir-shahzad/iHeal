'use strict';
module.exports = (sequelize, DataTypes) => {
    var prescriptionImage = sequelize.define('prescriptionImage', {
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
        imagePath: {
            type: DataTypes.STRING
        },
        imageType: {
            type: DataTypes.STRING
        },
        imageDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW 
        },
        detail: {
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
    return prescriptionImage;
};