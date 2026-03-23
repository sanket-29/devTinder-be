const  mongoose  = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: { 
            values:["ignored","interested","accepted","rejected"],
            message: `{VALUE} is not supported`
        },
    },
},
{
    timestamps: true
});


connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

// connectionRequestSchema.pre('save', function (next) {

//     const connectionRequest = this;

//     if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//         throw new Error("Cannot send connection request to self!!");
//     }
//     next()
// });

connectionRequestSchema.pre("save", async function() {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("Cannot send connection request to self!");
  }
});

const ConnectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = ConnectionRequestModel;