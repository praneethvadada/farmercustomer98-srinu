require('dotenv').config({ path: __dirname + '/.env' });


const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Debugging: Confirm the app is loading
console.log("✅ `app.js` successfully loaded into `server.js`");

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
