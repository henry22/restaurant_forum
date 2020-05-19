const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
    getUser: (req, res, callback) => {
        return User.findByPk(req.user.id, {
            include: [
                { model: Comment, include: Restaurant },
                { model: Restaurant, as: 'FavoritedRestaurants' },
                { model: User, as: 'Followers' },
                { model: User, as: 'Followings' }
            ]
        }).then(user => {
            user.dataValues.Comments = nonDuplicatedComments(user.dataValues.Comments)

            callback({
                user: user.toJSON(),
                editProfile: false,
                hasCommentRestaurants: user.dataValues.Comments.length > 0,
                hasFavoritedRestaurants: user.dataValues.FavoritedRestaurants.length > 0,
                hasFollowings: user.dataValues.Followings.length > 0,
                hasFollowers: user.dataValues.Followers.length > 0
            })
        }).catch(err => {
            console.log('Error:', err)
        })
    },
    putUser: (req, res, callback) => {
        if (Number(req.params.id) !== Number(req.user.id)) {
            callback({ status: 'error', message: 'permission denied' })
        }

        const { file } = req

        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                if (err) console.log('Error: ', err)

                return User.findByPk(req.params.id)
                    .then(user => {
                        user.update({
                            name: req.body.name,
                            image: file ? img.data.link : null
                        })

                        return user
                    })
                    .then(user => {
                        callback({ status: 'success', message: 'user was successfully to update' })
                    })
            })
        } else {
            return User.findByPk(req.params.id)
                .then(user => {
                    user.update({
                        name: req.body.name,
                        image: user.image
                    })

                    return user
                })
                .then(user => {
                    callback({ status: 'success', message: 'user was successfully to update' })
                })
        }
    },
    addFavorite: (req, res, callback) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        }).then(restaurant => {
            callback({ status: 'success', message: '' })
        })
    },
    removeFavorite: (req, res, callback) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        }).then(favorite => {
            favorite.destroy()
                .then(restaurant => {
                    callback({ status: 'success', message: '' })
                })
        })
    },
    addLike: (req, res, callback) => {
        return Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        }).then(restaurant => {
            callback({ status: 'success', message: '' })
        })
    },
    removeLike: (req, res, callback) => {
        return Like.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        }).then(like => {
            like.destroy()
                .then(restaurant => {
                    callback({ status: 'success', message: '' })
                })
        })
    },
    getTopUser: (req, res, callback) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

            callback({ users })
        })
    },
    addFollowing: (req, res, callback) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        }).then(followship => {
            callback({ status: 'success', message: '' })
        })
    },
    removeFollowing: (req, res, callback) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        }).then(followship => {
            followship.destroy()
                .then(followship => {
                    callback({ status: 'success', message: '' })
                })
        })
    }
}

function nonDuplicatedComments(arr) {
    return [...new Map(arr.map(item => [item.UserId, item])).values()]
}

module.exports = userService