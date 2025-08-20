# Production Environment: NPM Package

This document provides an overview of how the `smartcheckout-sdk` NPM package is versioned, built, and published.

## Package Overview

-   **Package Name**: `smartcheckout-sdk`
-   **Registry**: Public NPM registry ([https://www.npmjs.com/package/smartcheckout-sdk](https://www.npmjs.com/package/smartcheckout-sdk))

## Release Process

Releasing a new version of the SDK is managed by an automated GitHub Actions workflow defined in `.github/workflows/publish-npm.yml`. The process is triggered when a commit is pushed to the `main` branch that contains an updated version number in the `package.json` file.

### How to Release a New Version

To publish a new version of the package, a developer must perform the following manual steps from their local machine:

**1. Update the Local Branch**

Ensure you are on the `main` branch and have the latest changes from the remote repository.

```shell
git checkout main
git pull origin main
```

**2. Run the Release Command**

The repository provides a single, flexible script for releases. To use it, simply pass the desired version type or number as an argument.

-   **For a Patch Release**:
    ```shell
    npm run release patch
    ```

-   **For a Minor Release**:
    ```shell
    npm run release minor
    ```

-   **For a Specific Version**:
    ```shell
    npm run release 1.2.3
    ```

The script will automatically:
1.  Increment (or set) the `version` in `package.json` and `package-lock.json`.
2.  Create a git commit with the version update.
3.  Create a git tag for the new version.
4.  Push the commit and the tag to the `main` branch.

### Automated Workflow

Once the `release` script has pushed the new commit and tag to `main`, the "Publish to NPM" GitHub Action will automatically perform the following steps:

1.  **Version Check**: The workflow confirms that the `version` in `package.json` has actually changed compared to the previous commit. If not, it stops.
2.  **Build**: It installs all dependencies, runs any available tests, and builds the TypeScript source code into distributable JavaScript.
3.  **Pre-publish Check**: It checks the NPM registry to ensure the new version number does not already exist. If it does, the workflow will stop to prevent an error.
4.  **Publish**: It publishes the new version of the package to the public NPM registry using a secure token.
5.  **Tagging and Release**: After a successful publication, the workflow:
    -   Creates a new Git tag corresponding to the version (e.g., `v1.0.1`).
    -   Pushes the tag to the repository.
    -   Creates a new GitHub Release with details about the version and a link to the NPM package.
