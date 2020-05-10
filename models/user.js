'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN // 加入 isAdmin 欄位
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Comment)
  };
  return User;
};