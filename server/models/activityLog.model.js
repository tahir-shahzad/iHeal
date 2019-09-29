'use strict';
module.exports = (sequelize, DataTypes) => {
    const activityLog = sequelize.define('activityLog', {
        userId: {
            type: DataTypes.BIGINT
        },
        userName: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        userType: {
            type: DataTypes.STRING
        },
        clinicName: {
            type: DataTypes.STRING
        },
        activity: {
            type: DataTypes.STRING
        },
        totalcount: DataTypes.VIRTUAL,

        // Timestamps
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
            }
        },
        freezeTableName: true, });
    return activityLog;
};
