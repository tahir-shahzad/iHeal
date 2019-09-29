'use strict';
module.exports = (sequelize, DataTypes) => {
    const labSets = sequelize.define('labSets', {
        prescriptionId: {
            type: DataTypes.BIGINT
        },
        diagnosis: {
            type: DataTypes.STRING
        },
        additionalNotes: {
            type: DataTypes.STRING
        },
        labSet: {
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
    return labSets;
};