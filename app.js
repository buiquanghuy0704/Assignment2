const express = require("express");
const engines = require("consolidate");
const app = express();
var fs = require("fs");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require("path").join(__dirname, "/public");
app.use(express.static(publicDir));

// npm i handlebars consolidate --save
app.engine("hbs", engines.handlebars);
app.set("views", "./views");
app.set("view engine", "hbs");

app.get("/insert", (req, res) => {
  res.render("insert");
});

// ket noi database
var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://buiquanghuy742:buiquanghuy742@cluster0.2sybn.mongodb.net/test";

//localhost:5000
app.get("/product", async function (req, res) {
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  let result = await dbo.collection("product").find({}).toArray();
  res.render("index", { model: result });
});

// DELETE PRODUCT
app.get("/remove", async (req, res) => {
  let id = req.query.id;
  var ObjectID = require("mongodb").ObjectID;
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  await dbo.collection("product").deleteOne({ _id: ObjectID(id) });
  res.redirect("/product");
});

// DELETE USERS
app.get("/removeusers", async (req, res) => {
  let id = req.query.id;
  var ObjectID = require("mongodb").ObjectID;
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  await dbo.collection("user").deleteOne({ _id: ObjectID(id) });
  res.redirect("/users");
});

// INSERT
// connect to hbs
app.post("/doInsert", async (req, res) => {
  let inputName = req.body.txtName;
  let inputQuantity = req.body.txtQuantity;
  let inputPrice = req.body.txtPrice;
  let inputDescription = req.body.txtDescription;
  let inputImage = req.body.txtImage;
  let newProduct = {
    name: inputName,
    quantity: inputQuantity,
    price: inputPrice,
    description: inputDescription,
    image: inputImage,
  };
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  await dbo.collection("product").insertOne(newProduct);
  res.redirect("/product");
});

// SEARCH FUNCTION
app.get("/doSearch", async (req, res) => {
  let name_search = req.query.txtSearch;
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  let result = await dbo
    .collection("product")
    .find({ name: name_search })
    .toArray();
  res.render("index", { model: result });
});

// REGISTER
app.get("/register", function (req, res) {
  res.render("register");
});
var fileName = "users.txt";
// connect to hbs
app.post("/doRegister", async (req, res) => {
  let inputName = req.body.txtName;
  let inputEmail = req.body.txtEmail;
  // check data
  if (inputName.length < 4) {
    let errorModel = {
      emailError: "Email must have more than 3 characters",
      nameError: "Name must have more than 3 characters!",
    };
    res.render("/users", { model: errorModel });
  } else {
    let data = inputName + ";" + inputEmail + "\n";
    fs.appendFile(fileName, data, function (err) {
      res.redirect("/users");
    });
  }
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  await dbo
    .collection("user")
    .insertOne({ name: inputName, email: inputEmail });
  res.redirect("/users");
});

// get all users
app.get("/users", async (req, res) => {
  //     let result = [];
  //     fs.readFile(fileName,'utf8',function(error,data){
  //         let allUsers = data.split("\n");
  //         for(i=0;i<allUsers.length;i++){
  //             if(allUsers[i].trim().length !=0){
  //                 let nameX = allUsers[i].split(';')[0];
  //                 let emailX = allUsers[i].split(';')[1];
  //                 result.push({name:nameX,email:emailX})
  //             }
  //         }
  let client = await MongoClient.connect(url);
  let dbo = client.db("Product");
  let result = await dbo.collection("user").find({}).toArray();
  res.render("users", { model: result });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT);
