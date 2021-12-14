/*
This function is called when the payload is hit from the github webhook 

It creates a payload for each docs repo and then calls a function to create a job with the supplied payload and insert it in staging database
*/
  
exports = async function(payload) {
  var result = context.functions.execute("validateNewJob", payload);

  if (!result.valid) {
    return result.error ;
  }
  const coll_name = context.values.get("coll_name");
  const db_name_prod = context.values.get("db_name");
  
  const collection_test = await context.services.get("mongodb-atlas").db(db_name_prod).collection(coll_name);
  const reposApprovedForTesting = context.functions.execute("getReposApprovedForTesting")


  /* there is no email associated with release event payloads, 
     so we have to manually look it up 
  */
  const jobUserName  = payload.sender.login;
  const userNameMapping = context.functions.execute("getUsernameMapping");
  const jobUserEmail = userNameMapping[jobUserName];
  const jobTitle = "Regression Test Child Process";
  
  /*create payloads */
  reposApprovedForTesting.forEach((repo) => {
    const repoOwnerArg = repo["owner"];
    const repoNameArg = repo["name"];

    const newPayload = {
      jobType: "productionDeploy",
      source: "github",
      action: "push",
      repoName: repoNameArg,
      branchName: "master",
      isFork: true,
      private: repo["private"],
      isXlarge: true,
      repoOwner: repoOwnerArg,
      url: `https://github.com/${repoOwnerArg}/${repoNameArg}`,
      parentHash: payload.after,
      newHead: payload.after,
      regression: true
      };
    console.log(JSON.stringify(newPayload))

    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);
  });

};