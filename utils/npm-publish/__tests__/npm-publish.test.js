"use strict";

jest.mock("@lerna/child-process");

// mocked modules
const ChildProcessUtilities = require("@lerna/child-process");

// helpers
const Package = require("@lerna/package");

// file under test
const npmPublish = require("..");

describe("npm-publish", () => {
  ChildProcessUtilities.exec.mockResolvedValue();

  const pkg = new Package({ name: "test", version: "1.10.100" }, "/test/npmPublish");

  it("runs npm publish in a directory with --tag support", async () => {
    await npmPublish(pkg, "published-tag", { npmClient: "npm", otp: "12345" });

    expect(ChildProcessUtilities.exec).lastCalledWith(
      "npm",
      ["publish", "test-1.10.100.tgz", "--tag", "published-tag"],
      {
        cwd: pkg.location,
        env: {
          npm_config_otp: "12345",
        },
        pkg,
      }
    );
  });

  it("does not pass --tag when none present (npm default)", async () => {
    await npmPublish(pkg, undefined, { npmClient: "npm" });

    expect(ChildProcessUtilities.exec).lastCalledWith("npm", ["publish", "test-1.10.100.tgz"], {
      cwd: pkg.location,
      env: {},
      pkg,
    });
  });

  it("trims trailing whitespace in tag parameter", async () => {
    await npmPublish(pkg, "trailing-tag ", { npmClient: "npm" });

    expect(ChildProcessUtilities.exec).lastCalledWith(
      "npm",
      ["publish", "test-1.10.100.tgz", "--tag", "trailing-tag"],
      {
        cwd: pkg.location,
        env: {},
        pkg,
      }
    );
  });

  it("supports custom registry", async () => {
    const registry = "https://custom-registry/npmPublish";

    await npmPublish(pkg, "custom-registry", { npmClient: "npm", registry });

    expect(ChildProcessUtilities.exec).lastCalledWith(
      "npm",
      ["publish", "test-1.10.100.tgz", "--tag", "custom-registry"],
      {
        cwd: pkg.location,
        env: {
          npm_config_registry: registry,
        },
        pkg,
      }
    );
  });

  describe("with npmClient yarn", () => {
    it("appends --new-version to avoid interactive prompt", async () => {
      await npmPublish(pkg, "yarn-publish", { npmClient: "yarn" });

      expect(ChildProcessUtilities.exec).lastCalledWith(
        "yarn",
        [
          "publish",
          "test-1.10.100.tgz",
          "--tag",
          "yarn-publish",
          "--new-version",
          pkg.version,
          "--non-interactive",
        ],
        {
          cwd: pkg.location,
          env: {},
          pkg,
        }
      );
    });
  });

  describe("npmPack", () => {
    it("runs npm pack in a package directory", async () => {
      await npmPublish.npmPack(pkg);

      expect(ChildProcessUtilities.exec).lastCalledWith("npm", ["pack"], {
        cwd: pkg.location,
        env: {},
        pkg,
      });
    });
  });
});
