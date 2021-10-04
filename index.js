const express = require('express');
const app = require('express')();
const port = process.env.PORT || 5100;
const cors = require('cors');
const env = require('dotenv');
const { register, login, findUser, submitQuota } = require('./query');
env.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/favicon.ico', (req, res) => {
    res.status(204);
} )

app.post('/register', async (req, res) => {
    const { role, total_slp, user } = req.body
    const result = await register(role, total_slp, user)

    res.json({ result })
} )     

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    const result = await login(username, password)

    res.json({ result })
} )

app.post('/submit-quota', async (req, res) => {
    const { username, quotaToday } = req.body

    const result = await submitQuota( username, quotaToday )

    res.json(result)
} )

app.listen( port, () => {
    console.log(`Server running at ${port} `)
});