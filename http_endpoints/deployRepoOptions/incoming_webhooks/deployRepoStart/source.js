exports = async function(payload, response) {
  //respond to modal
  response.setHeader("Content-Type", "application/json");
  response.setStatusCode(200);
  
  // verify slack auth
  var slackAuth = context.functions.execute("validateSlackAPICall", payload);
  if (!slackAuth || slackAuth.status !== 'success') {
    return slackAuth;
  }
  
  console.log('----- BEGIN JOB FROM SLACK ------');
  
  // https://api.slack.com/interactivity/handling#payloads
  var parsed = JSON.parse(payload.query.payload);
  var stateValues = parsed.view.state.values; 
  

  // get repo options for this user from slack and send over
  var entitlement = await context.functions.execute("getUserEntitlements", {
    'query': {
      'user_id': parsed.user.id
    }
  });
  if (!entitlement || entitlement.status !== 'success') {
    return 'ERROR: you are not entitled to deploy any docs repos';
  }
  
  console.log('user deploying job', JSON.stringify(entitlement));
  
  // mapping of block id -> input id
  var values = {};
  var inputMapping = {
    'block_repo_option': 'repo_option',
    'block_hash_option': 'hash_option',
  };
  
  // get key and values to figure out what user wants to deploy
  for (var blockKey in inputMapping) {
    var blockInputKey = inputMapping[blockKey];
    var stateValuesObj = stateValues[blockKey][blockInputKey];
    // selected value from dropdown
    if (stateValuesObj && stateValuesObj.selected_option && stateValuesObj.selected_option.value) {
      values[blockInputKey] = stateValuesObj.selected_option.value;
    } 
    // multi select is an array
    else if (stateValuesObj && stateValuesObj.selected_options && stateValuesObj.selected_options.length > 0) {
      values[blockInputKey] = stateValuesObj.selected_options;
    }
    // input value
    else if (stateValuesObj && stateValuesObj.value) {
      values[blockInputKey] = stateValuesObj.value;
    } 
    // no input
    else {
      values[blockInputKey] = null;
    }
  }
  
  for (let i = 0; i < values.repo_option.length; i++) {
    // // e.g. mongodb/docs-realm/master => (site/repo/branch)
    const buildDetails = values.repo_option[i].value.split('/')
    const repoOwner = buildDetails[0]
    const repoName = buildDetails[1]
    const branchName = buildDetails[2] 
    const hashOption =  values.hash_option ? values.hash_option : null
    const jobTitle     = 'Slack deploy: ' + entitlement.github_username;
    const jobUserName  = entitlement.github_username;
    const jobUserEmail = entitlement.email ? entitlement.email : 'split@nothing.com';
    
    const branchObject = await context.functions.execute("getBranchAlias", repoName, branchName)
    
    if (!branchObject || !branchObject.aliasObject) continue;
    
    const active = branchObject.aliasObject.active
    const publishOriginalBranchName = branchObject.aliasObject.publishOriginalBranchName
    const aliases = branchObject.aliasObject.aliases
    
    if (!active) {
      continue;
    }
    //This is for non aliased branch
    if (aliases === null) {
      const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName,  hashOption, false, null)
      context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);  
    }
    //if this is stablebranch, we want autobuilder to know this is unaliased branch and therefore can reindex for search
    else {
          // we use the primary alias for indexing search, not the original branch name (ie 'master'), for aliased repos 
      if (publishOriginalBranchName && aliases) {
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName,  hashOption, true, null)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);  
      }
      aliases.forEach(function(alias, index) {
        const primaryAlias = (index === 0); 
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, hashOption, true, alias, primaryAlias)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail); 
      })
    }
  }
  
};