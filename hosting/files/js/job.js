// Initialize the App Client
const stitchClient = stitch.Stitch.initializeDefaultAppClient(window.STITCH_APP_ID);

stitchClient.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user => {
	console.log(`Logged in as anonymous user with id ${user.id}`);

	/***************************************************************************** 
	 *                 Get the current job by its _id field                      *
	 *****************************************************************************/
    const url = new URL(window.location.href);
    const dict = {};
    url.searchParams.forEach((v,k) => { dict[k] = v });
    
    // Would like to switch this out eventually
    collName = 'queue';
    if ('collName' in dict) {
        collName = dict['collName'];
    }
    console.log(JSON.stringify(dict));

    stitchClient.callFunction("getJobById", [dict["jobId"], collName]).then(result => {
        const job = {
            _id: result._id.toString(), 
            title: result.title, 
            user: result.user, 
            email: result.email, 
            priority: result.priority, 
            status: result.status, 
            createdTime: formatDate(result.createdTime), 
            startTime: formatDate(result.startTime), 
            endTime: formatDate(result.endTime),
            error: result.error, 
            result: result.result,
            payload: result.payload,
            logs: result.logs,
        }
        
        $('#json-renderer').jsonViewer(job);
    }).catch(err => {
        console.log(err)
    }); 
 });