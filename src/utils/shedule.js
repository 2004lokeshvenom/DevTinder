const cron = require('node-cron')
const connectionrequestmodel = require('../Models/connectionreq')
const { subDays, startOfDay, endOfDay } = require('date-fns')
const sendEmails = require('./sendEmail')

cron.schedule('48 2 * * *', async () => {
  try {
    const yesterday = subDays(new Date(), 1)

    const yesterdayStartDay = startOfDay(yesterday)
    const yesterdayEndDay = endOfDay(yesterday)

    const pendingUsers = await connectionrequestmodel
      .find({
        status: 'interested',
        createdAt: {
          $gte: yesterdayStartDay,
          $lt: yesterdayEndDay,
        },
      })
      .populate('fromUserId toUserId')

    const users = [...new Set(pendingUsers.map((req) => req.toUserId.email))]

    for (const email of users) {
      try {
        const subject = 'hello from DevTinder'
        const html = `<h1>You have pending requests! Open DevTinder to review.</h1>`
        const text = 'You have pending requests! Open DevTinder to review.'

        const res = await sendEmails.run(
          "lokeshvanamayya02@gmail.com",
          process.env.FROM_EMAIL,
          subject,
          html,
          text
        )

        console.log('Mail sent:', res)
      } catch (err) {
        console.log('Email sending error:', err)
      }
    }
  } catch (err) {
    console.log('Cron job error:', err)
  }
})
