const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const production = functions.config().general.production === 1;
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const SUBJECT = 'Taipei Ethereum Meetup - ticket information';
const ETHERSCAN_BASE = production ? 'https://etherscan.io/tx' : 'https://ropsten.etherscan.io/tx';

exports.sendRegisterEmail = functions.database.ref('/users/{wallet}').onCreate((event) => {
  const user = event.data.val();
  user.wallet = event.params.wallet;

  return sendRegisterEmail(user);
});

function sendRegisterEmail (user) {
  const mailOptions = {
    from: `Taipei Ethereum Meetup <eth.taipei@gmail.com>`,
    to: user.email,
  };

  mailOptions.subject = SUBJECT;
  mailOptions.text = `Hi ${user.name},\n\n Thank you to register this event, ` +
    `please take a look on transaction url to make sure your transaction is successful and also please show this email to our staff when you attend.\n\n` +
    `* Name: ${user.name}\n` +
    `* Email: ${user.email}\n` +
    `* Wallet: ${user.wallet}\n` +
    `* Transaction URL: ${ETHERSCAN_BASE + '/' + user.transaction}\n\n` +
    `- Taipei Ethereum Meetup`;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('registration email sent to:', user.email);
  });
}
