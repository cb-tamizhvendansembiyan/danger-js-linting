const PR_TITLE_REGEX = /^([\w-]+)\s?\((chore|docs|fix|feat|perf|refactor|style|test)\):\s?([\w+(,$&\s\-)*]+)/;
const PR_TITLE_FORMAT=""
const PR_CHANGELOG_ENTRY_REGEX = /^([\w-]+)\s?\((chore|docs|fix|feat|perf|refactor|style|test)\):\s?([\w+(,$&\s\-)*]+)\s\(([\w-]+)\)\s\[#(\d+)\]/;
const PR_CHANGELOG_ENTRY_FORMAT ="JIRA_ISSUE_ID (TYPE_OF_CHANGE): SOME_MEANINGFUL_TITLE (GH_USER_HANDLE) [#PR_NUMBER]";

function parseBody(prBody, lineSeparator) {
  let sections = {};
  let lines = prBody.split(lineSeparator || "\r\n");
  let currentSection = null;
  lines.forEach(line => {
    if (line.startsWith("##")) {
      currentSection = line.replace("##", "").trim()
      sections[currentSection] = {title: currentSection, lines : []}
      return
    }
    if (currentSection && line != "") {
      sections[currentSection].lines.push(line)
    }
  });
  return sections;
}

function parseTitle(prTitle) {
  const match = prTitle.match(PR_TITLE_REGEX);
  if (!Array.isArray(match) || match.length != 4) {
    return null;
  }
  return {jiraIssueId : match[1], typeOfChage : match[2], changeSummary: match[3]}
}

function parseChangelogEntry(changelogEntry) {
  const match = changelogEntry.match(PR_CHANGELOG_ENTRY_REGEX);
  if (!Array.isArray(match) || match.length != 6) {
    return null;
  }
  return {jiraIssueId : match[1], typeOfChage : match[2], changeSummary: match[3], author: match[4], prNumber: match[5]}
}

module.exports = {parseBody, parseTitle, parseChangelogEntry, PR_TITLE_REGEX, PR_CHANGELOG_ENTRY_REGEX, PR_TITLE_FORMAT, PR_CHANGELOG_ENTRY_FORMAT};