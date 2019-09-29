'use strict';
module.exports = (sequelize, DataTypes) => {
    const patient_detail = sequelize.define('patientDetail', {
        patientId: {
            type: DataTypes.BIGINT
        },
        maritialstatus: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        education: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        occupation: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        nationality: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        cnic: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        stateprovince: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        city: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        streetaddress: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        secondarymobile: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        othermobile: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        clinicid: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        registrationdate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        companyname: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        designation: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        otheridentification: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        reference: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        referredby: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        insurancecompany: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        picture: {
            type: DataTypes.STRING,
            defaultValue: null
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
    return patient_detail;
};