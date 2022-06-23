const PR_TITLE_REGEX = /^([\w-]+)\s?\((chore|docs|fix|feat|perf|refactor|style|test)\):\s?([\w+\s]+)/;

function parseBody(prBody) {
  let sections = {};
  let lines = prBody.split("\r\n");
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

module.exports = {parseBody, parseTitle, PR_TITLE_REGEX};