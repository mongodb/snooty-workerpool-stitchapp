exports = function(payload){
  
  // console.log("source: ", payload.fullDocument.source, ", target: ", payload.fullDocument.target);
  console.log(JSON.stringify(payload));
  if (payload === undefined ||
      payload.fullDocument === undefined ||
      payload.fullDocument.name === undefined ||
      payload.fullDocument.url === undefined) {
        //send message to admin
        return;
      }
        
  const translatedPayload = { "isXlarge": true, "jobType": "publishDochub", "source": payload.fullDocument.name, "target": payload.fullDocument.url };
  //, "email": "DocsPlatformTeam@mongodb.com" };
  
  //currently the DocsPlatformTeam@mongodb.com email is not set up to a slack channel/account - so no one on the team will get updates unforuntaely 
  //putting maddie.zechar is temporary until we have a lead 
  
  
  //6.3.2021
  //switching from maddie.zechar@mongodb.com to cassidy.schaufele@mongodb.com
  //intention is to fully remove email from this job, or otherwise mute notifications
  //but routing to another user until it's determined if we can do that safely
  //Cassidy Schaufele
  
  context.functions.execute("addJobToQueue", translatedPayload, "dochub admin", "Dochub Admin", "cassidy.schaufele@mongodb.com"); 
  // payload, jobTitle, jobUserName, jobUserEmail
  // name -- source
  // url -- target
  
  // also need email
  
  
};