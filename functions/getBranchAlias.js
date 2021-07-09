exports = async function(repoName, branchName) {
  const db_name = context.values.get('db_name');
  const coll_name = 'repos_branches';
  var returnObject = { status: 'failure' } 

  // get the queue collection
  const repoBranchesColl = context.services.get("mongodb-atlas").db(db_name).collection(coll_name);
  try{
      const aliasArray = await repoBranchesColl.aggregate(
      [
      {"$match":{"repoName": repoName}}, 
      {"$unwind": "$branches"}, {"$match": {"branches.name": branchName}}, 
      {"$project": {"branches":1}}
      ]
    )
    .toArray()
    
   if(aliasArray.length === 1) {
     returnObject.aliasObject = aliasArray[0].branches
     returnObject.status = "success"
   }
   
   return returnObject 
   
  }catch(err){
    console.log("error in getBranchAlias", err)
    throw err
  }

  
};