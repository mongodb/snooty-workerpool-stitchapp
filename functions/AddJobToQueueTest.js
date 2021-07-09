/*
  See https://developer.github.com/v3/activity/events/types/#webhook-payload-example for
  examples of payloads.

  Try running in the console below.
*/
  
exports = function() {

  try {
    let jobTitle     = "Github Push: " + 'test node';
    let jobUserName  = 'Sue K';
    let jobUserEmail = 'sue.kerschbaumer@mongodb.com';
    const newPayload = {
      jobType: "githubPush",
      source: "github",
      action: "push",
      repoName: "docs-node",
      branchName: "DOP-TEST123",
      isFork: true,
      private: false,
      isXlarge: true,
      repoOwner: "skerschb",
      url: 'https://github.com/skerschb/docs-node.git',
      newHead: "50c7adb311e02f20ae46010254d0d8ed0460f9db"
  }
    
    console.log(JSON.stringify(newPayload));
    
    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);  
  } catch(err) {
    console.log(err);
  }
  
};