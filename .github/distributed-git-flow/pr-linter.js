const prParser = require("./pr-parser");
const prEnabler = require("./pr-enabler");
const fs = require("fs");

function lintPr(reporter, pr) {
  if (prEnabler.isPrFromStagingToDevelopBranch(pr) || prEnabler.isPrFromMasterToStagingBranch(pr)) {
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
  reporter.warn(`PR linting from \`${pr.head.ref}\` to \`${pr.base.ref}\` not supported`)
}

function lintPrFromDevelopToStaging(reporter, pr) {
  lintConsolidatedChangesPrTitle(reporter, pr);
  lintConsolidatedChangesPrBody(reporter, pr);
}

function lintConsolidatedChangesPrTitle(reporter, {title, head}) {
  let expectedPrTitle = head.ref.charAt(0).toUpperCase() + head.ref.slice(1)
  if (title !== expectedPrTitle) {
    reporter.fail(`Expected PR Title \`${expectedPrTitle}\` but found \`${title}\``)
  }
}

function lintConsolidatedChangesPrBody(reporter, pr) {
  let prBodySections = prParser.parseBody(pr.body);
  let changelogSection = prBodySections["CHANGELOG"];
  let jiraIssueUrlsSection = prBodySections["JIRA ISSUE URLS"];
  let prism8UrlSection = prBodySections["PRISM 8 REPORT URL"];

  if (!changelogSection || changelogSection.lines == 0) {
    reporter.fail("`CHANGELOG` section is required")
    return;
  }
  if (!jiraIssueUrlsSection || jiraIssueUrlsSection.lines == 0) {
    reporter.fail("`JIRA ISSUE URLS` section is required")
    return;
  }
  if (!prism8UrlSection || prism8UrlSection.lines == 0) {
    reporter.fail("`PRISM 8 REPORT URL` section is required")
    return;
  }
  lintChangelog(reporter, changelogSection);
}

function lintChangelog(reporter, {lines}) {
  let changelogEntries = [];
  lines.forEach(line => {
    let changelogEntry = prParser.parseChangelogEntry(line);
    if (changelogEntry == null) {
      reporter.fail(`The changelog entry \`${line}\` not conforms to the format \`${prParser.PR_CHANGELOG_ENTRY_FORMAT}\`\r\nTechnically, it should match this regex \`${prParser.PR_CHANGELOG_ENTRY_REGEX}\``)
      return 
    }
    changelogEntries.push(changelogEntry);
  });
  if (lines.length != changelogEntries.length) {
    return null
  }
  return changelogEntries
}

function lintPrFromStagingToMaster(reporter, pr) {
  lintConsolidatedChangesPrTitle(reporter, pr);
  lintConsolidatedChangesPrBody(reporter, pr);
}

function lintAtomicChangePr(reporter, pr) {
  if (prEnabler.isMergeConflictResolutionPr(pr)) {
    return
  }
  let lintedPrTitle = lintPrTitle(reporter, pr);
  if (lintedPrTitle == null) {
    return
  }
  lintAtomicChangePrBody(reporter, lintedPrTitle, pr);
}

function lintAtomicChangePrBody(reporter, {jiraIssueId, typeOfChage}, pr) {
  let prTemplateFilePath = __dirname.replace("distributed-git-flow", "") + `PULL_REQUEST_TEMPLATE/${typeOfChage}.md`
  let prTemplateBody = fs.readFileSync(prTemplateFilePath, {encoding: "utf-8"});
  let expectedPrBodySections = prParser.parseBody(prTemplateBody, "\n");
  let actualPrBodySections = prParser.parseBody(pr.body);
  for (const [key, value] of Object.entries(expectedPrBodySections)) {
    if (!actualPrBodySections[key]) {
      reporter.fail(`PR Body should have the \`${key}\` section`);
      continue
    }
    if (actualPrBodySections[key].lines.length == 0) {
      reporter.fail(`The \`${key}\` section should not be empty. Use \`N/A\` if it is not applicable/available`);
      continue
    }
    if (actualPrBodySections[key].lines[0] == value.lines[0]) {
      reporter.fail(`Populate the \`${key}\` section with the appropriate information. Use \`N/A\` if it is not applicable/available`);
      continue
    }
    lintAtomicChangePrBodySection(reporter, jiraIssueId, key, actualPrBodySections[key])
  } 
}

function lintJiraIssueUrl(reporter, jiraIssueId, jiraIssueUrlSection) {
  if (jiraIssueUrlSection.lines.length > 1) {
    reporter.fail(`\`${jiraIssueUrlSection.title}\` section should contain only one line with the corresponding JIRA ISSUE URLs. A PR should always point to one JIRA ISSUE` )
    return;
  }
  lintJiraIssueUrl(reporter, jiraIssueId, jiraIssueUrlSection.lines[0]);
}

function lintJiraIssueUrl(reporter, jiraIssueId, jiraIssueUrl) {
  let expectedJiraIssueUrl = `https://${process.env.ALTASSIAN_HOST_NAME}.atlassian.net/browse/${jiraIssueId}`
  if (jiraIssueUrl !== expectedJiraIssueUrl) {
    reporter.fail(`\`${jiraIssueUrlSection.title}\`: Expected: \`${expectedJiraIssueUrl}\` Found: \`${jiraIssueUrlSection.lines[0]}\``);
  }
}

function hasPopulatedWithNotAvailable(section) {
  return section.lines[0].trim().toLowerCase() == "n/a";
}

function lintThePresenceofNotAvailable(reporter, rootCauseSection) {
  if (hasPopulatedWithNotAvailable(rootCauseSection)) {
    reporter.fail(`\`${rootCauseSection.title}\`: Should not contain \`${rootCauseSection.lines[0]}\``);
  } 
}

function lintPrism8ReportUrl(reporter, prism8ReportUrlSection) {
  if (prism8ReportUrlSection.lines.length > 1) {
    reporter.fail(`\`${prism8ReportUrlSection.title}\` section should contain only one line with the corresponding PRISM URLs. A PR should always point to one latest PRISM RUN` )
    return;
  }
}

function lintAtomicChangePrBodySection(reporter, jiraIssueId, key, prSection) {
  switch (key) {
    case "JIRA ISSUE URL":
      return lintJiraIssueUrl(reporter, jiraIssueId, prSection);
    case "ROOT CAUSE":
    case "SUMMARY_OF_CHANGE(s)":
    case "AREAS_OF_IMPACT":
    case "SUMMARY OF THE IMPROVEMENT MADE":
    case "OLD_METRIC":
    case "NEW_METRIC":
    case "REASON FOR REFACTORING":
      return lintThePresenceofNotAvailable(reporter, prSection);
    case "PRISM 8 REPORT URL":
      return lintPrism8ReportUrl(reporter, prSection)
  }
}

function lintPrTitle(reporter, {title}) {
  let prTitle = prParser.parseTitle(title);
  if (prTitle == null) {
    reporter.fail(`PR title should be of format \`${prParser.PR_TITLE_FORMAT}\`.\r\nTechnically, it should match this regex: \`${prParser.PR_TITLE_REGEX}\``);
    return null;
  }
  if (prTitle.changeSummary.includes("REPLACE_ME")) {
    reporter.fail("PR title should not contain `" + prTitle.changeSummary + "`")
  }
  return prTitle;
}

module.exports = {lintPr};