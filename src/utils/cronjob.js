const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const {subDays, startOfDay, endOfDay} = require("date-fns");
const sendEmail = require("../utils/sendEmail");

cron.schedule("0 8 * * *", async () => {
    try {
       
        const yesterday = subDays(new Date(), 1);

        const yesterdayStart = startOfDay(yesterday);

        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = await ConnectionRequest.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lte: yesterdayEnd
            }
        }).populate("fromUserId toUserId");


        const listOfEmails = [...new Set(pendingRequests.map((req) => req.toUserId.emailId))];

        console.log(listOfEmails);
        for (const email of listOfEmails) {
            try {
                const res = await sendEmail.run(
                    "Pending Connection Requests","There are pending connection requests, please login to your account to review them.");

                    console.log(res);
            } catch (error) {
                console.log(error);
            }
        }

    } catch (err) {
        console.log("ERROR: " + err.message);
    }
});