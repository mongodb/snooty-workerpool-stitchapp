// This function is the webhook's request handler.
exports = async function (payload, response) {
  try {
    let jobTitle = "DevHub CMS Staging Build";
    let jobUserName = "Jordan";
    let jobUserEmail = "jordan.stapinski@mongodb.com";
    const newPayload = {
      jobType: "githubPush",
      source: "strapi",
      action: "push",
      repoName: "devhub-content-integration",
      branchName: "strapi",
      isFork: true,
      private: true,
      isXlarge: true,
      // Can this be generalized to use the devhub-content master branch instead of my fork?
      repoOwner: "jestapinski",
      url: "https://github.com/jestapinski/devhub-content-integration.git",
      newHead: null,
    };

    context.functions.execute(
      "addJobToQueue",
      newPayload,
      jobTitle,
      jobUserName,
      jobUserEmail
    );
  } catch (err) {
    console.log(err);
  }
};
