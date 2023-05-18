var app = require("express")();
var url = require("url");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var fs = require("fs");

// Serve chatClient.html on root route
app.get("/", function (req, res) {
  console.log("get:chatClient.html");
  res.sendFile("chatClient.html", { root: __dirname });
});

// Serve other web resources
app.use(function (req, res) {
  var fileName = url.parse(req.url).pathname.replace("/", "");
  fs.access(fileName, fs.constants.F_OK, function (err) {
    if (err) {
      console.log("File not found:", fileName);
      res.sendStatus(404);
    } else {
      res.sendFile(fileName, { root: __dirname });
      console.log("use:", fileName);
    }
  });
});

// Handle errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Generate unique IDs using closures
var uniqueID = (function () {
  var id = 0;
  return function () {
    return id++;
  };
})();

// Handle socket connections
io.sockets.on("connection", function (client) {
  var clientID = uniqueID();
  console.log("Connection: " + clientID);
  client.on("message", function (value) {
    io.sockets.emit("message", { clientID: clientID, message: value });
  });
});

server.listen(3000);
console.log("listening at http://127.0.0.1:3000...");
