/*==============================================================================
|                               SERVER CONFIGUARATION                          |
===============================================================================*/
require("dotenv").config();
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
app.enable("trust proxy");
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);
const server = http.createServer(app).listen(8080, () => {
  console.log("Http server started http://localhost:8080");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mysql = require("mysql2");
const func = require("./main");
const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "esomaz",
  nestTables: true,
});

var sql =
  "SELECT * FROM Posts LEFT JOIN Comments ON Comments.PostId=Posts.id LEFT JOIN Users ON Posts.UserId=Users.id LEFT JOIN Users AS CommentedBy ON Comments.UserId=CommentedBy.id";

//Key relations, Define each table's primary and foreign keys
var nestingOptions = [
  {
    tableName: "Posts",
    pkey: "id",
    fkeys: [{ table: "Users", col: "UserId" }],
  },
  {
    tableName: "Comments",
    pkey: "id",
    fkeys: [
      { table: "Posts", col: "PostId" },
      { table: "CommentedBy", col: "UserId" },
    ],
  },
  { tableName: "Users", pkey: "id" },
  { tableName: "CommentedBy", pkey: "id" },
];
connection.query({ sql: sql }, function (err, rows) {
  // error handling
  if (err) {
    console.log("Internal error: ", err);
    console.log("Mysql query execution error!");
  } else {
    var nestedRows = func.convertToNested(rows, nestingOptions);

    console.log(nestedRows);
  }
});
