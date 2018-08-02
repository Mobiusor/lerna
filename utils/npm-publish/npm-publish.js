"use strict";

const log = require("npmlog");

const ChildProcessUtilities = require("@lerna/child-process");
const getExecOpts = require("@lerna/get-npm-exec-opts");

module.exports = npmPublish;
module.exports.npmPack = npmPack;

function npmPublish(pkg, tag, { npmClient, registry, otp }) {
  log.verbose("publish", pkg.name);

  const distTag = tag && tag.trim();
  const opts = getExecOpts(pkg, registry, otp);
  const args = ["publish", pkg.tarball];

  if (distTag) {
    args.push("--tag", distTag);
  }

  if (npmClient === "yarn") {
    // skip prompt for new version, use existing instead
    // https://yarnpkg.com/en/docs/cli/publish#toc-yarn-publish-new-version
    args.push("--new-version", pkg.version, "--non-interactive");
  }

  return ChildProcessUtilities.exec(npmClient, args, opts);
}

function npmPack(pkg) {
  log.verbose("pack", pkg.name);

  const opts = getExecOpts(pkg);
  const args = ["pack"];

  return ChildProcessUtilities.exec("npm", args, opts);
}
