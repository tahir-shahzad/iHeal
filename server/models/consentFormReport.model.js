'use strict';
module.exports = (sequelize, DataTypes) => {
    const consentFormReports = sequelize.define('consentFormReports', {

        patientId: {
            type: DataTypes.BIGINT
        },
        patientName: {
            type: DataTypes.STRING
        },
        clinicName: {
            type: DataTypes.STRING
        },
        managmentType: {
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
    return consentFormReports;
};
