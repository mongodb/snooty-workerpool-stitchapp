

exports = async function(payload){
  const axios = require('axios').default;
  // console.log("source: ", payload.fullDocument.source, ", target: ", payload.fullDocument.target);
  console.log(JSON.stringify(payload));
  if (payload === undefined ||
      payload.fullDocument === undefined ||
      payload.fullDocument.name === undefined ||
      payload.fullDocument.url === undefined) {
        //send message to admin
        return;
      }
        
  const translatedPayload = {  "source": payload.fullDocument.name, "target": payload.fullDocument.url };
  await axios.post('https://qr4zntq72h.execute-api.us-east-2.amazonaws.com/prd/webhook/dochub/trigger/upsert', translatedPayload);
};