const sgMail = require('@sendgrid/mail')


//SENDERGRID_API_KEY is the api key to be able to send mails on sendGrid
sgMail.setApiKey(process.env.SENDERGRID_API_KEY) //to set the apikey for send grid to know it should use our account

const sendWelcomeEmail = (email, name, ) => {
    sgMail.send({
        to: email,
        from: 'christopher.c.eid@outlook.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}


const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'christopher.c.eid@outlook.com',
        subject: 'Sad to see you leave',
        text: `Goodbye ${name}, see you later.`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}