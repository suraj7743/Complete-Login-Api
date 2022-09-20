const app = require("./app");
const PORT = process.env.PORT || 8000;

//running the server
app.listen(PORT || 8000, () => {
  console.log(`listening to server on  port ${PORT}`);
});
