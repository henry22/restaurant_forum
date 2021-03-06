const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restService = {
    getRestaurants: (req, res, callback) => {
        let offset = 0
        let whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery['CategoryId'] = categoryId
        }

        return Restaurant.findAndCountAll({
            include: Category,
            where: whereQuery,
            offset: offset,
            limit: pageLimit
        }).then(result => {
            // data for pagination
            let page = Number(req.query.page) || 1
            let pages = Math.ceil(result.count / pageLimit)
            let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            let prev = page - 1 < 1 ? 1 : page - 1
            let next = page + 1 > pages ? pages : page + 1
            // clean up restaurant data
            const data = result.rows.map(r => ({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLiked: req.user.LikedRestaurants.some(d => d.id === r.id)
            }))

            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => { // 取出 categories
                callback({
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: Comment, include: [User] },
                { model: User, as: 'FavoritedUsers' },
                { model: User, as: 'LikedUsers' }
            ]
        }).then(restaurant => {
            const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
            const isLiked = restaurant.LikedUsers.some(d => d.id === req.user.id)

            restaurant.increment('viewCounts')
                .then(restaurant => {
                    callback({
                        restaurant: restaurant.toJSON(),
                        isFavorited: isFavorited,
                        isLiked: isLiked
                    })
                })
        })
    },
    getFeeds: (req, res, callback) => {
        return Restaurant.findAll({
            limit: 10,
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
            include: [Category]
        }).then(restaurants => {
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            }).then(comments => {
                callback({
                    restaurants: restaurants,
                    comments: comments
                })
            })
        })
    },
    getRestaurantDashboard: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                Comment
            ]
        }).then(restaurant => {
            callback({ restaurant: restaurant.toJSON() })
        })
    },
    getTopRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            include: [
                { model: User, as: 'FavoritedUsers' }
            ],
            limit: 10
        }).then(restaurants => {
            restaurants = restaurants.map(restaurant => ({
                ...restaurant.dataValues,
                description: restaurant.description.substr(0, 50),
                FavoritedCount: restaurant.FavoritedUsers.length,
                isFavorited: req.user.FavoritedRestaurants.some(d => d.id === restaurant.id)
            }))

            restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount)

            callback({ restaurants })
        })
    }
}

module.exports = restService