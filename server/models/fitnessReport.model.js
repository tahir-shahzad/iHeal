'use strict';
module.exports = (sequelize, DataTypes) => {
    const fitnessReports = sequelize.define('fitnessReports', {
        patientId: {
            type: DataTypes.BIGINT
        },
        patientName: {
            type: DataTypes.STRING
        },
        temp: {
            type: DataTypes.STRING
        },
        tempPoint: {
            type: DataTypes.STRING
        },
        pulse: {
            type: DataTypes.STRING
        },
        height: {
            type: DataTypes.STRING
        },
        weight: {
            type: DataTypes.STRING
        },
        fitnesstest: {
            type: DataTypes.STRING
        },
        colorVision: {
            type: DataTypes.STRING
        },
        leftEye: {
            type: DataTypes.STRING
        },
        rightEye: {
            type: DataTypes.STRING
        },
        bloodPressure: {
            type: DataTypes.STRING
        },
        bloodSugar: {
            type: DataTypes.STRING
        },
        notes: {
            type: DataTypes.STRING
        },
        reportData: {
            type: DataTypes.DATE
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
    return fitnessReports;
};
