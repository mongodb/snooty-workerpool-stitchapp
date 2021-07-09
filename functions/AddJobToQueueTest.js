/*
  See https://developer.github.com/v3/activity/events/types/#webhook-payload-example for
  examples of payloads.

  Try running in the console below.
*/
  
exports = function() {

  try {
    let jobTitle     = "Github Push: " + 'test node';
    let jobUserName  = 'Maddie Z';
    let jobUserEmail = 'maddie.zechar@mongodb.com';
    const newPayload = {
      jobType: "githubPush",
      source: "github",
      action: "push",
      repoName: "docs-node",
      branchName: "DOP-TEST123",
      isFork: true,
      private: false,
      isXlarge: true,
      repoOwner: "madelinezec",
      url: 'https://github.com/madelinezec/docs-node.git',
      newHead: null
  }
    
    console.log(JSON.stringify(newPayload));
    
    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);  
  } catch(err) {
    console.log(err);
  }
  
};