const express = require('express');
const app = express();
const port = 3090;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route for the homepage
app.get('/', (req, res) => {
    res.send('Welcome to the TurboWarp Server!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
