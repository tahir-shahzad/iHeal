'use strict';
module.exports = (sequelize, DataTypes) => {
    const OrderSetSchema = sequelize.define('orderSet', {
        diagnosis : {
            type: DataTypes.STRING
        },
        additionalNote : {
            type: DataTypes.STRING
        },
        medicine : {
            type: DataTypes.STRING
        },
        frequency : {
            type: DataTypes.STRING
        },
        duration : {
            type: DataTypes.STRING
        },
        quantity  : {
            type: DataTypes.STRING
        },
        lifeStyleInstructions : {
            type: DataTypes.STRING
        },
        labSet:{
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
    return OrderSetSchema;
};