# TalentNexus contracts Gitflow

## Branches and pull requests

- `main` contains stable releases.
- `staging` contains releases being verified before production.
- `dev` contains development releases.
- Start every feature from the current `main` branch and name it `feature/{dev_name}/{work-name}`.
- Use a non-fast-forward merge commit for every promotion. Do not use squash or rebase merges.

Open a PR for review and validation, but perform every promotion locally so target-branch changes never enter the feature branch. Promote the same feature branch in this order:

1. Open `feature/...` to `dev`. Its first dev PR needs exactly one label: `release:major`, `release:minor`, or `release:patch`. Wait for **Build package** to pass, then merge locally and push `dev`.
2. After the dev package publishes, open that same feature branch to `staging`. Wait for **Build package** to pass, then merge locally and push `staging`.
3. After the staging package publishes, open that same feature branch to `main`. Wait for **Build package** to pass, then merge locally and push `main`.

Use these commands for each target branch, replacing `dev` with `staging` or `main` at the appropriate promotion step:

```bash
git fetch origin
git checkout dev
git pull --ff-only origin dev
git merge --no-ff feature/{dev_name}/{work-name}
# Resolve conflicts here, if necessary.
git push origin dev
```

Do not change the default merge subject. It must remain `Merge branch 'feature/{dev_name}/{work-name}' into {target}` so the release workflow can identify the feature branch and its commit.

Never merge, rebase, or pull `dev`, `staging`, or `main` into a feature branch. If a conflict occurs, resolve it during the local target-branch merge, then push that target branch. Do not resolve conflicts in GitHub's web interface.

If any commit is added to a feature branch after its dev release, locally merge it into `dev` and let the dev workflow publish it again before promoting it to `staging`. The staging and main workflows require the exact feature head that passed the preceding environment.

Every push to a `feature/**` branch runs the **Build feature branch** workflow. Once a promotion PR is open, each push also triggers the required **Build package** PR validation through GitHub's pull-request synchronization event. Publishing never runs on a push; it runs only after the relevant PR has merged.

## Version and npm release policy

The target-branch push workflow creates annotated Git tags and sets the package version only inside its runner before publishing. Source files and `package.json` are not changed by release automation.

| Target branch | Version format | npm dist-tag |
| --- | --- | --- |
| `dev` | `X.Y.Z-dev.N` | `dev` |
| `staging` | `X.Y.Z-pre.N` | `pre` |
| `main` | `X.Y.Z` | `latest` |

The first dev PR for a feature branch uses its label to determine the major, minor, or patch base-version bump from the highest released base version, including dev and staging prereleases. Later dev PRs from that branch retain the first base version and only increment its numeric prerelease suffix: `X.Y.Z-dev.1`, `X.Y.Z-dev.2`, and so on. The matching staging and stable publications retain that same base version.

Each release tag records its source branch and the second parent of the local merge commit. This is how the staging and main workflows verify that the feature has passed through the prior environment without merging environment branches back into the feature branch.

The release workflow explicitly assigns the npm dist-tag after publishing, including on a retry. Therefore `npm install @talent-nexus/contracts@dev`, `@pre`, and the unqualified package name resolve to the version for their respective channel.

## GitHub configuration

The promotion workflow intentionally requires direct pushes of local merge commits to `dev`, `staging`, and `main`. Do not enable a branch rule that requires GitHub PR merges for these branches. Instead, restrict direct push permission to approved promotors, block force pushes and deletions, and allow merge commits only. The release workflow builds the pushed target branch and publishes only when that build succeeds.

Create an npm automation token with publish access to `@talent-nexus/contracts` and save it as the repository or environment secret `NPM_TOKEN`. The release workflows need repository contents write permission to create annotated release tags.
