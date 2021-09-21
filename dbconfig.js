const { MongoClient } = require('mongodb');
const url = process.env.DB_CON;

let cache = null;

const connectDB = async () => {
    if(cache) {
        console.log(" Using cache ");
        return Promise.resolve(cache)
    } else {
        console.log("asdf")
        return MongoClient.connect(process.env.DB_CON, {
            // native_parser: true,
            useUnifiedTopology: true,
        })
        .then( (client) => {
            let db = client.db("crypto");
            console.log("New DB Connection");
            cache = db;
            return cache;
        } )
        .catch( (e) => {
            console.log(e);
            console.log("Mongo Connection error");
        } )
    }
}

module.exports = connectDB

// const client = new MongoClient(url, 
//     { useNewUrlParser: true, useUnifiedTopology: true }
// );

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });