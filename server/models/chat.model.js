'use strict';
module.exports = (sequelize, DataTypes) => {
    const chat = sequelize.define('chat', {
        
        senderId : {
            type: DataTypes.BIGINT
        },
        Room: {
            type: DataTypes.STRING
        },
        text: {
            type: DataTypes.STRING
        },
        
        receiverId :{
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
            },
            freezeTableName: true,
        });
    return chat;
};
