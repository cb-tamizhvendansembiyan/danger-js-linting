const { Octokit } = require("@octokit/rest");
const prLinter = require("./distributed-git-flow/pr-linter");

const octokit = new Octokit({
  auth: process.env.GH_PAT,
});

const reporter = {
  fail : (msg) => console.log("FAIL: " + msg),
  warn : (msg) => console.log("WARN: " + msg)
}

octokit.pulls.get({
  owner: process.env.GH_OWNER,
  repo: process.env.GH_REPO,
  pull_number: 10544
}).then(({data}) => {
  prLinter.lintPr(reporter, data);
});