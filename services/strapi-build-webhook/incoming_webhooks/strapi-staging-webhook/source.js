// This function is the webhook's request handler.
exports = async function(payload, response) {
    console.log(Object.keys(payload.query))

      try {
        let jobTitle     = "DevHub CMS Staging Build";
        let jobUserName  = "Jordan";
        let jobUserEmail = "jordan.stapinski@mongodb.com";
        const newPayload = {
          jobType:    "githubPush",
          source:     "strapi", 
          action:     "push", 
          repoName:   "devhub-content-integration", 
          branchName: "strapi",
          isFork:     true, 
          private:    true,
          isXlarge:   true,
          repoOwner:  "jestapinski",
          url:        "https://github.com/jestapinski/devhub-content-integration.git",
          newHead:    null,
        }; 
    
    console.log(JSON.stringify(newPayload));
    let coll_name = context.values.get("coll_name");

    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail, coll_name);  
    
  } catch(err) {
    console.log(err);
  }


   
};