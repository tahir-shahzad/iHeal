'use strict';
module.exports = (sequelize, DataTypes) => {
    const clinic = sequelize.define('clinic', {
        clinicname: {
            type: DataTypes.STRING
        },
        latitude: {
            type: DataTypes.STRING
        },
        longitude: {
            type: DataTypes.STRING
        },
        userData: DataTypes.VIRTUAL,
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
    return clinic;
};