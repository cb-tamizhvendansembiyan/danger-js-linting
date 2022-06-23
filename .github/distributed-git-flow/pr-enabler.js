function isPrToDevelopBranch(pr) {
  return pr.base.ref.startsWith("develop/");
}

function isPrToStagingBranch(pr) {
  return pr.base.ref.startsWith("staging/");
}

function isPrToMasterBranch(pr) {
  return pr.base.ref === "master";
}

function isPrFromDevelopBranch(pr) {
  return pr.head.ref.startsWith("develop/");
}

function isPrFromStagingBranch(pr) {
  return pr.head.ref.startsWith("staging/");
}

function isMergeConflictResolutionPr(pr) {
  return pr.title.startsWith("Parent branch sync");
}

function isPrFromStagingToDevelopBranch(pr) {
  return pr.head.ref.replace(/staging/g, "develop") === pr.base.ref
}

function isPrFromMasterToStagingBranch(pr) {
  return pr.head.ref === "master" && pr.base.ref.startsWith("staging/")
}

module.exports = {isPrToDevelopBranch, isPrToStagingBranch, isPrToMasterBranch, isPrFromDevelopBranch, 
  isPrFromStagingBranch, isMergeConflictResolutionPr, isPrFromStagingToDevelopBranch, isPrFromMasterToStagingBranch}