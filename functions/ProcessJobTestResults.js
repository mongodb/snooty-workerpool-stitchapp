exports = function(payload){
  
  // console.log("source: ", payload.fullDocument.source, ", target: ", payload.fullDocument.target);
  if (payload === undefined ||
      payload.fullDocument === undefined) {
        //send message to admin
        console.log('no doc');
        return;
      }
        
  if (payload.fullDocument.status === 'failed') {
    console.log("message admin");
    //context.functions.execute("")
  }
  
  for (i = 0; i < payload.fullDocument.logs.try0; ++i) {
    if(payload.fullDocument.logs.try0[i].contains("Failed to upload to S3")) {
        console.log("message admin");
    }
  }
  

  
};