# 餐廳評論網

##### 「餐廳評論網」的目標是幫助網站使用者完成以下事情：
- 找到好餐廳。
- 查看餐廳的基本資訊。

## 安裝

#### NPM的使用

```
- node.js v-10.15.0
- bcryptjs
- body-parser
- connect-flash
- dotenv
- express
- express-handlebars
- express-session
- faker
- imgur-node-api
- method-override
- multer
- mysql2
- passport
- passport-local
- pg
- sequelize
- sequelize-cli
```

##### 確認本機是否安裝 [MySql](https://dev.mysql.com/downloads/mysql/)

##### 1.開啟終端機到存放專案本機位置並執行:
`git clone https://github.com/henry22/restaurant_forum`

##### 2.初始設定
```
1. 切換目錄到專案: cd restaurant_forum
2. 安裝套件: npm install
3. 進入[圖片網站 Imgur](https://api.imgur.com/oauth2/addclient) 註冊，取得clientID
4. 建立.env的檔案，將上述取得的clientID貼至下述
- IMGUR_CLIENT_ID=<Imgur clientID>
```

#### 3.修改 /config/config.json
```
- 修改 development mode 的設定，加入資料庫的名字與密碼，刪除"operatorsAliases": false

"development": {
  "username": "root",
  "password": "your password",
  "database": "forum",
  "host": "127.0.0.1",
  "dialect": "mysql",
  "operatorsAliases": false
}
```

##### 4.資料庫設定
```
- 請在 MySQL Workbench 輸入下方指令，建立 forum 資料庫

drop database if exists forum;
create database forum;
use forum;
```

##### 5.建立 Users 和 Restaurants Table

- npx sequelize db:migrate

##### 6.建立種子資料

- npx sequelize db:seed:all

#### 7.執行程式
```
1. 終端機輸入: nodemon run dev
2. 開啟網頁輸入: http://localhost:3000
```

## 主要功能
- 前台簡易入口
- 使用者註冊/登入/登出功能
- 後台權限驗證
- 後台餐廳 CRUD
- 使用者與餐廳假資料
- 上傳圖片功能 (串接 Imur API)

## 測試帳號

| Name  | Email             | Password | 預設權限  |
| ----- | ----------------- | -------- | -------- |
| root  | root@example.com  | 12345678 | admin    |
| user1 | user1@example.com | 12345678 | user     |
| user2 | user2@example.com | 12345678 | user     |