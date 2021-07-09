exports = function(jobType, repoOwner, repoName, branchName, newHead, aliased=false, alias=null, primaryAlias=false, stable=""){
    try {
      const newPayload = {
        jobType,
        source:     "github", 
        action:     "push", 
        repoName, 
        branchName,
        aliased,
        alias,
        isFork:     true, 
        private:    ( repoOwner === '10gen') ? true : false,
        isXlarge:   true,
        repoOwner,
        url:        'https://github.com/' + repoOwner + '/' + repoName,
        newHead, 
        primaryAlias,
        stable
      }; 
      console.log("in create new payload ", JSON.stringify(newPayload))
      return newPayload
    } catch(err) {
      console.log(err);
      throw err;
    }
    
};