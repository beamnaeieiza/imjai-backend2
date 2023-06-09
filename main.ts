import express from "express";

console.log("hello world");
let app = express();

app.use(express.json());

app.listen(3306, () => {
  console.log("Application is running.");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
