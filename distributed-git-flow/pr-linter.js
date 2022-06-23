const prParser = require("./pr-parser");
const prEnabler = require("./pr-enabler");

function lintPr(reporter, pr) {
  if (prEnabler.isPrToDevelopBranch(pr)) {
    lintAtomicChangePr(reporter, pr)
    return
  }
  if (prEnabler.isPrToStagingBranch(pr)) {
    if (prEnabler.isPrFromDevelopBranch(pr)) {
      lintPrFromDevelopToStaging(reporter, pr);
      return
    }
    lintAtomicChangePr(reporter, pr)
    return
  }
  if (prEnabler.isPrToMasterBranch(pr) && prEnabler.isPrFromStagingBranch(pr)) {
    lintPrFromStagingToMaster(reporter, pr)
    return
  }
  reporter.warn(`PR linting from ${pr.head.ref} to ${pr.base.ref} not supported`)
}

function lintPrFromDevelopToStaging(reporter, pr) {

}

function lintPrFromStagingToMaster(reporter, pr) {

}

function lintAtomicChangePr(reporter, pr) {
  let prTitle = lintPrTitle(reporter, pr);
  if (prTitle == null) {
    return
  }
}

function lintPrTitle(reporter, {title}) {
  let prTitle = prParser.parseTitle(title);
  if (prTitle == null) {
    reporter.fail("PR title should be of format `JIRA_ISSUE_ID (TYPE_OF_CHANGE): SOME_MEANINGFUL_TITLE`.\r\nTechnically, it should match this regex: `" + prParser.PR_TITLE_REGEX + "`");
    return null;
  }
  if (prTitle.changeSummary.includes("REPLACE_ME")) {
    reporter.fail("PR title should not contain " + prTitle.changeSummary)
  }
  return prTitle;
}

module.exports = {lintPr};