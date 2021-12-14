// This function is the webhook's request handler.
exports = async function(payload, response) {
      try {
        let jobTitle     = "DevHub CMS Prod Build";
        let jobUserName  = "jestapinski";
        let jobUserEmail = "split@nothing.com";
        const newPayload = {
          jobType:    "productionDeploy",
          source:     "strapi", 
          action:     "push", 
          repoName:   "devhub-content", 
          branchName: "master",
          isFork:     true, 
          private:    true,
          isXlarge:   true,
          repoOwner:  "10gen",
          url:        "https://github.com/10gen/devhub-content",
          newHead:    null,
        }; 
    
    console.log(JSON.stringify(newPayload));
    let coll_name = context.values.get("coll_name");
    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail, coll_name);  
  } catch(err) {
    console.log(err);
  }


    return  "Hello World!";
};