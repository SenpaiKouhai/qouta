const ConnectDB  = require('./db/dbcon');
const bcrypt = require('bcrypt')
const User = require('./db/model')

const findUser = async () => {
    await ConnectDB()
    try {
        let user = await User.find({})
        return user
    } catch (e) {
        return { e: e }
    }
}

const register = async (role, total_slp, user) => {
    await ConnectDB();
    try {
        // validate user if exist
        console.log("validating...")
        let isExist = await User.findOne({ username: user.username})
        if(isExist) {
            let res = { success: false, msg: "User already exist" }
            return res
        }

        // hashing password
        console.log("Hashing...")
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(user.password, salt);
     
        const addUser = new User({
            username: user.username,
            password: hashPass,
            role: role,
            total_slp: total_slp
        })

        console.log("Adding...")
        const newUser = await addUser.save()
        return { success: true, newUser: newUser.username, msg: "User successfully added" }
    } catch (e) {
        console.log(e)
        return { success: false, msg: "There was an error connecting to database.", e: e }
    }
}

const login = async (username, pass) => {
    await ConnectDB()
    try {
        console.log("Finding User")
        let user = await User.findOne({ username: username })
        if(user) {
            // found the user
            console.log("Validating User")
            if( await bcrypt.compare(pass, user.password) ) {
                // granted
                return { 
                    success: true, 
                    username: user.username, 
                    role: user.role,
                    total_slp: user.total_slp 
                }
            } else {
                // password not matched
                return { success: false, msg: "Your password is incorrect" }
            }
        } else {
            // user doesn't exist
            return { success: false, msg: "Username doesn't exist" }
        }
    } catch (e) {
        console.log(e)
        return { success: false, msg: "There was an error connecting to database.", e: e }
    }
}


const insert = async (name) => {
    let result = null;
    const exist = await User.findOne({ username: name });
    console.log(exist)
    if(exist) {
        result = { success: false, msg: "User already exist" }
        return result;
    }

    const value = {
        username: name,
        total_slp: 0
    }
    const user = new User(value);
    await user.save().then( (user) => {
        result = user
    } )
    .catch( err => { 
        result = { success: false, error: err, msg: "Something went wrong in mongodb server" }
    } )
    return result;
}

const dailyQouta = async (username, qouta, total_slp) => {
    let result;
    const filter = { username: username }
    const datetime = new Date();
    const user = await User.findOne(filter);
    const total = Number(qouta) + Number(user.total_slp)
    const value = {$set: { total_slp: total }, 
        $addToSet: 
            {
                qouta: { 
                    daily: qouta, 
                    date_added: datetime.toISOString().slice(0,10),
                    total_slp_today: total
                } 
            }
    }
    // await User.findOneAndUpdate( filter, value, { new: true })
    return new Promise( async (resolve, reject) => {
        await User.findOneAndUpdate( filter, value, { new: true }, (err, res) => {
            if(err) {
                reject(err)
            } else {
                resolve(res);
            }
        })
    } )
}

const updateSlp = async (username, slp) => {
    const filter = { username: username }
    const value = { $set: { slp: slp } }
    let user = await User.findOneAndUpdate(filter, value, { new: true } )

    return { success: true, user }
}

module.exports = { register, login, insert, updateSlp, dailyQouta, findUser }