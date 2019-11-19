#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const { version } = require("./package.json");
const shell = require("shelljs");
const semver = require("semver");

const script = async () => {
  welcome();
  gitOrQuit();

  const options = getOptions();

  const tag = await latestTag(options.branch);
  if (tag) {
    console.log(chalk.green("Latest tag is ") + chalk.black.bgGreen(tag));
  } else {
    console.log(chalk.green("No tags found, starting with 0.0.0"));
  }

  const newVersion = await incrementTag(tag || "0.0.0");
  if (newVersion) {
    const prefix = options.prefix ? options.prefix + "/" : "";
    shell.exec(
      `git tag -a ${prefix}${newVersion} ${
        options.branch ? options.branch : ""
      } -m "Version ${prefix}${newVersion} released on ${new Date().toLocaleDateString()}"`,
      { silent: true }
    );
    shell.exec(`git push --tags`);
    console.log(
      chalk`{green Pushed new tag} {bgGreen.black ${prefix}${newVersion}} {green succesfully}`
    );
  }
};

const welcome = () => {
  console.log(chalk.black.bgGreen(`tag-semver v${version} running`));
};

const gitOrQuit = () => {
  if (!shell.which("git")) {
    console.log(
      chalk.red("Could not find git, which is required for this script to run.")
    );
    shell.exit(1);
  }
};

const latestTag = async branch => {
  shell.exec(
    `git fetch origin ${branch ? branch : ""} refs/tags/*:refs/tags/* --prune`
  );
  const tag = shell.exec(
    `git describe --tag $(git rev-parse --verify refs/remotes/origin/${branch})`,
    { silent: true }
  );
  if (tag.stderr && tag.code !== 128) {
    console.log(chalk.red.italic(`The following error occured:`));
    console.log(chalk.red(tag.stderr));
    shell.exit(1);
  } else if (tag.code === 128) {
    return null;
  } else {
    return semver.valid(semver.coerce(tag.stdout, { loose: true }));
  }
};

const getOptions = () => {
  const options = {
    branch: "master",
    prefix: "true"
  };
  const availableOptionKeys = ["branch", "prefix"];
  for (let i = 2; i < process.argv.length; i++) {
    const optionKey = process.argv[i].split("--")[1];
    if (availableOptionKeys.find(val => val === optionKey)) {
      options[optionKey] = process.argv[i + 1];
    }
  }
  return options;
};

const incrementTag = async tag => {
  const cleanTag = semver.parse(semver.clean(tag));
  if (cleanTag) {
    const newVersion = await inquirer.prompt({
      type: "list",
      name: "semver",
      message: "Select the new version:",
      choices: [
        {
          value: semver.inc(cleanTag.version, "patch"),
          name: `patch version (e.g. bug fixes): ${semver.inc(
            cleanTag.version,
            "patch"
          )}`
        },
        {
          name: `minor version (e.g. new functionality, no breaking changes): ${semver.inc(
            cleanTag.version,
            "minor"
          )}`,
          value: semver.inc(cleanTag.version, "minor")
        },
        {
          name: `major version (e.g. breaking changes): ${semver.inc(
            cleanTag.version,
            "major"
          )}`,
          value: semver.inc(cleanTag.version, "major")
        }
      ]
    });
    return newVersion.semver;
  }
};

script();
