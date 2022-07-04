## A PR linter for Distributed Fit Flow 
A PR linter powered by danger.js

### Local Development & Testing
For local development/testing, set the following environment variables
```
export GH_PAT=REPLACE_ME_WITH_YOUR_GITHUB_PERSONAL_TOKEN
export GH_OWNER=REPLACE_ME_WITH_YOUR_GITHUB_ORG_NAME
export GH_REPO=REPLACE_ME_WITH_YOUR_GITHUB_REPO_NAME
export ATLASSIAN_HOSTNAME=REPLACE_ME_WITH_YOUR_ORG_ATLASSIAN_HOSTNAME
```
and run the following command from the root directory of this repository
```
node .github/distributed-git-flow/scratch-pad.js REPLACE_ME_WITH_PR_NUMBER
```