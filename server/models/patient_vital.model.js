'use strict';
module.exports = (sequelize, DataTypes) => {
    const PatientVitalSchema = sequelize.define('patientVital', {
        userId: {
            type: DataTypes.BIGINT
        },
        patientId: {
            type: DataTypes.BIGINT
        },
        temperature: {
            type: DataTypes.STRING
        },
        temperaturePoint: {
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
        fitnessTest: {
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
        vitalDate: {
            type: DataTypes.STRING,
            // defaultValue: DataTypes.NOW
        },
        vitalTime: {
            type: DataTypes.STRING,
            // defaultValue: DataTypes.NOW
        },
        clinicId: {
            type: DataTypes.BIGINT
        }, 
        bloodPressurePosition: {
            type: DataTypes.STRING
        },
        bloodSugarType: {
            type: DataTypes.STRING
        }, 
        leftEye1: {
            type: DataTypes.STRING
        }, 
        rightEye1: {
            type: DataTypes.STRING
        }, 
        spectacles: {
            type: DataTypes.STRING
        },
        drugAllergies: {
            type: DataTypes.STRING
        },
        habits: {
            type: DataTypes.STRING
        },
        otherHabits:{
            type: DataTypes.STRING
        },
        medication: {
            type: DataTypes.STRING
        }, 
        chronicDisease: {
            type: DataTypes.STRING
        },
        duration: {
            type: DataTypes.STRING
        }, 
        period: {
            type: DataTypes.STRING
        },
        detail: {
            type: DataTypes.STRING
        },
        bmi: {
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
    return PatientVitalSchema;
};