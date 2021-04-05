exports = function(jobId, collName){
  const db_name = context.values.get("db_name");
  var queueCollection = context.services.get("mongodb-atlas").db(db_name).collection(collName);
  return queueCollection.findOne({_id: BSON.ObjectId(jobId)}).then(doc => {
      return doc;
  });
};