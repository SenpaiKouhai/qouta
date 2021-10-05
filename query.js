const ConnectDB  = require('./db/dbcon');
const bcrypt = require('bcrypt')
const User = require('./db/model')
const moment = require('moment')

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

const getQuotaList = async (username, number) => {
    await ConnectDB();
    try {
        console.log("Finding User")
        let user = await User.findOne({ username: username }, { quota: { $slice: number } }).select("-password")
        if(user) {

            return { success: true, user: user }
        }

        return { success: false, msg: "Cannot find user" }

    } catch (e) {
        console.log(e)
        return { success: false, msg: "There was an error connecting to database.", e: e }
    }
}

const submitQuota = async ( username, quotaToday ) => {
    await ConnectDB();
    try {
        console.log("Finding the user...")
        const filter = { username: username }
        const date = moment().format('ll')
        const user = await User.findOne(filter);
        if(user) {
            console.log("Calculating quota...")
            const total = Number(quotaToday) + Number(user.total_slp)
            const value = {$set: { total_slp: total }, 
                $push: 
                    {
                        quota: { 
                            $each: [{
                                daily: quotaToday, 
                                date_added: date,
                                total_slp_today: total
                            }],
                            $position: 0
                            
                        }
                    }
            }
    
            let res = await User.findOneAndUpdate(filter, value, { new: true }).select("-password")
            return { success: true, user: res }
        }
        
        return { success: false, msg: "User not found" }

    } catch (e) {
        console.log(e)
        return { success: false, msg: "There was an error connecting to database.", e: e }
    }
}

const resubmitQuota = async ( username, date_added, editQuota ) => {
    await ConnectDB();
    try {
        console.log("Finding the user...")
        const filter = { username: username }
        const user = await User.findOne(filter);
        if(user) {
            console.log("Calculating quota...")
            // less the added quota earlier
            const prevQuota = Number(user.total_slp) - Number(user.quota[0].daily)
            console.log(prevQuota)
            const total = Number(editQuota) + Number(prevQuota)
            const updateTotal = {$set: { total_slp: total }}
            const value = {
                $set: 
                    {
                        'quota.0': { 
                            daily: editQuota, 
                            date_added: date_added,
                            total_slp_today: total 
                        }
                    }
            }
            await User.findOneAndUpdate(filter, value, { new: true })
            let res = await User.findOneAndUpdate(filter, updateTotal, { new: true } ).select("-password")
            return { success: true, user: res }
        }
        
        return { success: false, msg: "User not found" }

    } catch (e) {
        console.log(e)
        return { success: false, msg: "There was an error connecting to database.", e: e }
    }
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

module.exports = { register, login, submitQuota, resubmitQuota, findUser, getQuotaList }