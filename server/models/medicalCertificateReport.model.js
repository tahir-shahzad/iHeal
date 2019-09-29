'use strict';
module.exports = (sequelize, DataTypes) => {
    const medicalCertificateReports = sequelize.define('medicalCertificateReports', {
        patientId: {
            type: DataTypes.BIGINT
        },
        patientName: {
            type: DataTypes.STRING
        },
        patientAddress: {
            type: DataTypes.STRING
        },
        examineDate: {
            type: DataTypes.STRING
        },
        doctorName: {
            type: DataTypes.STRING
        },
        note: {
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
        freezeTableName: true, });
    return medicalCertificateReports;
};
