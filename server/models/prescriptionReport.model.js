'use strict';
module.exports = (sequelize, DataTypes) => {
    const prescriptionReports = sequelize.define('prescriptionReports', {
        patientId: {
            type: DataTypes.BIGINT
        },
        patientName: {
            type: DataTypes.STRING
        },
        doctorName: {
            type: DataTypes.STRING
        },
        assistantName: {
            type: DataTypes.STRING
        },
        clinicName: {
            type: DataTypes.STRING
        },
        mrNo: {
            type: DataTypes.STRING
        },
        vitalReadings: {
            type: DataTypes.STRING
        },
        complains: {
            type: DataTypes.STRING
        },
        allergies: {
            type: DataTypes.STRING
        },
        chronicDiseasesHistory: {
            type: DataTypes.STRING
        },
        instruction: {
            type: DataTypes.STRING
        },
        medications: {
            type: DataTypes.STRING
        },
        reportDate: {
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
            freezeTableName: true,
        });
    return prescriptionReports;
};
