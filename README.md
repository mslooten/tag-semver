# tag-semver

_Easily create a tag/release with a semver version number_

It reads the latest semver tags from a supplied branch (otherwise master) and makes you choose the increment (e.g. major, minor or patch). It will then automatically create a annotated tag for the supplied branch with the new version number.

![GIF demonstrating the use of tag-semver](https://raw.githubusercontent.com/mslooten/tag-semver/master/tag-semver.gif)

## Usage

Install using NPM or Yarn:

`npm install tag-semver` or `yarn add tag-semver`

Then create a custom script in your package.json, for instance named 'release':

```
...
"scripts": {
  "release": "tag-semver"
}
...
```

There's two flags you can use:

`--branch [branch name]` (default: master)
The branch to create the tag on.

`--prefix [prefix name]` (default: none) The prefix for tags, for instance: 'release' which will result in "release/[version]".

After that, you can run "npm run release" or "yarn release" to actually run the script.
