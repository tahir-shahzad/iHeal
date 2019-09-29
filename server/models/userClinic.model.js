'use strict';
module.exports = (sequelize, DataTypes) => {
    const user_clinic = sequelize.define('userClinic', {
        userid: {
            type: DataTypes.BIGINT
        },
        clinicid: {
            type: DataTypes.BIGINT
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
    return user_clinic;
};