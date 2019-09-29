'use strict';
module.exports = (sequelize, DataTypes) => {
    const medicalProfileReports = sequelize.define('medicalProfileReports', {
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
        currentDiseases: {
            type: DataTypes.STRING
        },
        frequentProblem: {
            type: DataTypes.STRING
        },
        allergies: {
            type: DataTypes.STRING
        },
        surgeries: {
            type: DataTypes.STRING
        },
        dailyMedication: {
            type: DataTypes.STRING
        },
        familyHistory: {
            type: DataTypes.STRING
        },
        doctorRemarks: {
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
    return medicalProfileReports;
};
