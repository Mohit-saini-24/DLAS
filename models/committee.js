const mongoose = require('mongoose')

const members_schema = new mongoose.Schema({
    member_name: String,
    amount: Number
})

const details_schema = new mongoose.Schema({
    pool_no:Number,
    bid_percentage:Number,
    winner:String,
    winning_amount:Number,
    commission_earned:Number,
    money_transferred_by_members:[members_schema]
})


const committee_schema = new mongoose.Schema({
    committeeName: String,
    committeeAmount: Number,
    commissionPercentage: Number,
    noOfMembers: Number,
    biddingFrequency : Number,
    members: {
        type:Array,
        maxlength: 10
        },
    startDate: Date,
    commmitteeDetails:[details_schema],
    membersLeft:Array,
    moneyDistributed: Number,
})



module.exports = mongoose.model('Committee',committee_schema)