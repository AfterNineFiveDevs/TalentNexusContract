# TalentNexus contracts Gitflow

## Branches and pull requests

- `main` contains stable releases.
- `staging` contains releases being verified before production.
- `dev` contains development releases.
- Start every feature from the current `main` branch and name it `feature/{dev_name}/{work-name}`.
- Use a merge commit for every promotion pull request. Do not use squash or rebase merges.

Promote the same feature branch in this order:

1. Open `feature/...` to `dev`. Add exactly one label: `release:major`, `release:minor`, or `release:patch`.
2. After the dev pull request is merged, validated, and published, open that same feature branch to `staging`.
3. After the staging pull request is merged, validated, and published, open that same feature branch to `main`.

Never merge, rebase, or pull `dev`, `staging`, or `main` into a feature branch. If a conflict occurs, resolve it locally on the feature branch, commit the resolution, and push it. Do not resolve conflicts in GitHub's web interface.

If any commit is added to a feature branch after its dev release, merge it into `dev` and let the dev workflow publish it again before promoting it to `staging`. The staging and main workflows require the exact feature head that passed the preceding environment.

## Version and npm release policy

The merged-PR workflow creates annotated Git tags and sets the package version only inside its runner before publishing. Source files and `package.json` are not changed by release automation.

| Target branch | Version format | npm dist-tag |
| --- | --- | --- |
| `dev` | `X.Y.Z-dev.N` | `dev` |
| `staging` | `X.Y.Z-pre.N` | `pre` |
| `main` | `X.Y.Z` | `latest` |

The `dev` PR label determines its major, minor, or patch base-version bump from the highest released base version, including dev and staging prereleases. The matching staging and stable publications retain that same base version. Numeric prerelease suffixes make repeated npm publishes unique.

Each release tag records its source branch and source head SHA. This is how the staging and main workflows verify that the feature has passed through the prior environment without merging environment branches back into the feature branch.

The release workflow explicitly assigns the npm dist-tag after publishing, including on a retry. Therefore `npm install @talent-nexus/contracts@dev`, `@pre`, and the unqualified package name resolve to the version for their respective channel.

## GitHub configuration

Protect `dev`, `staging`, and `main` with pull requests required, the **Build package** status check required, and merge commits as the permitted merge method. Restrict direct pushes to these branches.

Create an npm automation token with publish access to `@talent-nexus/contracts` and save it as the repository or environment secret `NPM_TOKEN`. The release workflows need repository contents write permission to create annotated release tags.
