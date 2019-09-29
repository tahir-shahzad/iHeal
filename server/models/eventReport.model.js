'use strict';
module.exports = (sequelize, DataTypes) => {
    const eventReports = sequelize.define('eventReports', {

        eventName: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.STRING
        },
        personEffected: {
            type: DataTypes.STRING
        },
        natureOfInjury: {
            type: DataTypes.STRING
        },
        afterEvent: {
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
            freezeTableName: true,
        });
    return eventReports;
};
