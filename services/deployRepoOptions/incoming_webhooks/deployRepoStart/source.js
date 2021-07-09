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
    // // e.g. mongodb/docs-realm/master => (repoOwner/repoName/branchName)
    const buildDetails = values.repo_option[i].value.split('/')
    const repoOwner = buildDetails[0]
    const repoName = buildDetails[1]
    const branchName = buildDetails[2] 
    const hashOption =  values.hash_option ? values.hash_option : null
    const jobTitle     = 'Slack deploy: ' + entitlement.github_username;
    const jobUserName  = entitlement.github_username;
    const jobUserEmail = entitlement.email ? entitlement.email : 'unknown@example.com';
    
    const branchObject = await context.functions.execute("getBranchAlias", repoName, branchName)
    
    if (!branchObject || !branchObject.aliasObject) continue;
    
    const active = branchObject.aliasObject.active //bool
    const publishOriginalBranchName = branchObject.aliasObject.publishOriginalBranchName //bool
    const aliases = branchObject.aliasObject.urlAliases //array or null
    const urlSlug = branchObject.aliasObject.urlSlug //string or null, string must match value in urlAliases or gitBranchName
    const isStableBranch = branchObject.aliasObject.isStableBranch // bool or Falsey

    if (!active) {
      continue;
    }
    // createNewPayload: function(jobType, repoOwner, repoName, branchName, newHead, aliased=false, alias=null, primaryAlias=false, stable="")
    // This is for non aliased branch
    if (aliases === null) {
      const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, hashOption, false, null, false, "-g")
      context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);  
    }
    // TODO: include whether it's the "stable" branch in the payload so we'll know -- get it out of Atlas
    else {
      var stable = ''
      if (isStableBranch) { stable = '-g' }
      // we use the primary alias (urlSlug) for search indexing, not the original gitBranchName if urlSlug is set 
      if (urlSlug) {
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, hashOption, true, urlSlug, true, stable)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUSerName, jobUserEmail);
      }
      // if urlSlug is not set, and publishOriginalBranchName is True, we need to build the original gitBranchName, and set its primaryness to true
      else if (publishOriginalBranchName) {
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, hashOption, true, null, true, stable)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUSerName, jobUserEmail);
      } 
      // if publishOriginalBranchName is false and there isn't a urlSlug set (but there are aliases listed), we have a problem because that is not a valid branch entry
      else {
        return `ERROR: ${branchName} is misconfigured and cannot be deployed. Ensure that publishOriginalBranchName is set to true and/or specify a default urlSlug.`
      }
      // add jobs for remaining aliases to the queue
      aliases.forEach(function(alias) {
        // if the alias matches the urlSlug value, skip it since we've already built it
        if (alias == urlSlug) {return;}
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, hashOption, true, alias, false, false)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail);
      })
    }
  }
  
};