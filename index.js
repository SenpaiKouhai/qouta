const express = require('express');
const app = require('express')();
const port = process.env.PORT || 5000;
const cors = require('cors');
// const { corsOptionsDelegate } = require('./config')
const env = require('dotenv');
const ConnectDB  = require('./dbconfig')
env.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    const db = await ConnectDB();
    const collection = await db.collection("qouta");

    const users = await collection.find({}).toArray();

    return res.json({users});
})

app.listen( port, () => {
    console.log(`Server running at ${port} `)
});