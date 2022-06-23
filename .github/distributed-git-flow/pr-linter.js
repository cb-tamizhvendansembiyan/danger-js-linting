const prParser = require("./pr-parser");
const prEnabler = require("./pr-enabler");
const fs = require("fs");

function lintPr(reporter, pr) {
  if (isPrFromStagingToDevelopBranch(pr) || isPrFromMasterToStagingBranch(pr)) {
    return
  }
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
  if (prEnabler.isMergeConflictResolutionPr(pr)) {
    return
  }
  let prTitle = lintPrTitle(reporter, pr);
  if (prTitle == null) {
    return
  }
  lintAtomicChangePrBody(reporter, prTitle, pr);
}

function lintAtomicChangePrBody(reporter, {jiraIssueId, typeOfChage}, pr) {
  let prTemplateFilePath = __dirname.replace("distributed-git-flow", "") + `PULL_REQUEST_TEMPLATE/${typeOfChage}.md`
  let prTemplateBody = fs.readFileSync(prTemplateFilePath, {encoding: "utf-8"});
  let expectedPrBodySections = prParser.parseBody(prTemplateBody, "\n");
  let actualPrBodySections = prParser.parseBody(pr.body);
  for (const [key, value] of Object.entries(expectedPrBodySections)) {
    if (!actualPrBodySections[key]) {
      reporter.fail(`PR Body should have the ${key} section`);
      continue
    }
    if (actualPrBodySections[key].lines.length == 0) {
      reporter.fail(`The ${key} section should not be empty. Use N/A if it is not applicable/available`);
      continue
    }
    if (actualPrBodySections[key].lines[0] == value.lines[0]) {
      reporter.fail(`Populate the ${key} section with the appropriate information. Use N/A if it is not applicable/available`);
      continue
    }
    lintAtomicChangePrBodySection(reporter, jiraIssueId, key, actualPrBodySections[key])
  } 
}

function lintJiraIssueUrl(reporter, jiraIssueId, jiraIssueUrlSection) {
  if (jiraIssueUrlSection.lines.length > 1) {
    reporter.fail(`${jiraIssueUrlSection.title} section should contain only one line with the corresponding JIRA ISSUE URLs. A PR should always point to one JIRA ISSUE` )
    return;
  }
  let expectedJiraIssueUrl = `https://${process.env.ALTASSIAN_HOST_NAME}.atlassian.net/browse/${jiraIssueId}`
  if (jiraIssueUrlSection.lines[0] !== expectedJiraIssueUrl) {
    reporter.fail(`${jiraIssueUrlSection.title}: Expected: "${expectedJiraIssueUrl}" Found: "${jiraIssueUrlSection.lines[0]}"`);
  }
}

function lintRootCause(reporter, rootCauseSection) {
  if (rootCauseSection.lines[0].trim().toLowerCase() == "n/a") {
    reporter.fail(`${rootCauseSection.title}: Should not contain ${rootCauseSection.lines[0]}`);
  } 
}

function lintAtomicChangePrBodySection(reporter, jiraIssueId, key, prSection) {
  if (key == "JIRA ISSUE URL") {
    return lintJiraIssueUrl(reporter, jiraIssueId, prSection);
  }
  if (key == "ROOT CAUSE") {
    return lintRootCause(reporter, prSection);
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