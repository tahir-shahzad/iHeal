'use strict';
module.exports = (sequelize, DataTypes) => {
    const callSession = sequelize.define('callSession', {
        userId: {
            type: DataTypes.BIGINT
        },
        room: {
            type: DataTypes.STRING
        },
        receiverId: {
            type: DataTypes.STRING
        },
        token: {
            type: DataTypes.STRING
        },
        sessionId:{
            type: DataTypes.BIGINT
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
    return callSession;
};
