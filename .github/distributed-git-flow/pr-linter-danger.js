import { danger, fail, warn } from 'danger'
const prLinter = require("./pr-linter");

prLinter.lintPr({fail, warn}, danger.github.pr)