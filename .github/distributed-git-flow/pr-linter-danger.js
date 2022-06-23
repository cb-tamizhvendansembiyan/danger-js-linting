const danger = require("danger");
const prLinter = require("./pr-linter");

prLinter.lintPr(danger, danger.github.pr)