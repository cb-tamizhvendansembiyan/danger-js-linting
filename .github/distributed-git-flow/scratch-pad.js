const { Octokit } = require("@octokit/rest");
const prLinter = require("./pr-linter");

const octokit = new Octokit({
  auth: process.env.GH_PAT,
});

const reporter = {
  fail : (msg) => console.log("FAIL: " + msg),
  warn : (msg) => console.log("WARN: " + msg)
}

// const fs = require("fs");
// const prParser = require("./pr-parser");
// let prTemplateFilePath = __dirname.replace("distributed-git-flow", "") + `PULL_REQUEST_TEMPLATE/fix.md`
// let prTemplateBody = fs.readFileSync(prTemplateFilePath, {encoding: "utf-8"});
// console.log(JSON.stringify(prParser.parseBody(prTemplateBody, "\n")));

octokit.pulls.get({
  owner: process.env.GH_OWNER,
  repo: process.env.GH_REPO,
  pull_number: process.argv[2]
}).then(({data}) => {
  prLinter.lintPr(reporter, data);
});