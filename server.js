const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions ={
  origin:"http://localhost:5500/frontend/",
  Credentials:true
}
// env config
require("dotenv").config();
const app = express();
app.use(cors(corsOptions));

// requiring local modules
const open = require("./Routes/open");
const auth = require("./Routes/auth");
const products = require("./Routes/products");
const services = require("./Routes/services");
const askDesk = require("./Routes/askDesk");

//db connect
require("./Database/connection.js");

// presets
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// port declaration
// const port = 3600;
const port = process.env.PORT || 8000;
// const port = 5005;

// open routes
app.use("/", (request, response) => {
  response.send("hello");
})
app.use("/auth", auth);
app.use("/products", products);
app.use("/services", services);
app.use("/askdesk", askDesk);

// Init the server
app.listen(port, () => {
  console.log(`Sever is up ${port} `);
});
