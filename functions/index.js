const functions = require('firebase-functions');
const cors = require('cors')({ origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
const dotenv = require('dotenv')
dotenv.config()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const { SessionsClient } = require('dialogflow');
const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;


    const sessionClient = new SessionsClient({ credentials: serviceAccount  });
    const session = sessionClient.sessionPath(process.env.DIALOGFLOW_PROJECT, sessionId);


    const responses = await sessionClient.detectIntent({ session, queryInput});

    const result = responses[0].queryResult;

    response.send(result);
  });
});

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({ request, response });

  const result = request.body.queryResult;


  async function userOnboardingHandler(agent) {

   // Do backend stuff here
   const db = admin.firestore();
   const profile = db.collection('users').doc('jeffd23');

   const { name, color } = result.parameters;

    await profile.set({ name, color })
    agent.add(`Welcome aboard my friend!`);
  }


  let intentMap = new Map();
  intentMap.set('UserOnboarding', userOnboardingHandler);
  agent.handleRequest(intentMap);
});