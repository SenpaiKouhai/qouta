// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

let cache = global.mongoose;

if (!cache) {
    cache = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
    if(cache.conn) {
        console.log(" Using cache ");
        return cache.conn
    } 
    
    if(!cache.promise) {
        console.log(" Creating new Connection on mongoose ")
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false,
        }
        cache.promise = mongoose.connect(process.env.DB_CON, opts).then((mongoose) => {
            return mongoose
        })
        .catch( err => console.log(err) )
    }
    cache.conn = await cache.promise
    return cache.conn
}

module.exports = connectDB
