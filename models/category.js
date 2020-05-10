'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    name: DataTypes.STRING
  }, {});
  Category.associate = function(models) {
    Category.hasMany(models.Restaurant)
  };
  return Category;
};