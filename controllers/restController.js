const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: Category
    }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))

      return res.render('restaurants', {
        restaurants: JSON.parse(JSON.stringify(data))
      })
    })
  }
}

module.exports = restController