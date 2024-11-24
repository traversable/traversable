# traversable 🏝️

packages that belong to the [`@traversable`](https://www.npmjs.com/org/traversable) project.


## getting started

This project is almost ready to be used. Check back soon!


## workspaces

### dependency graph

Visualization:

```mermaid
flowchart TD
    bench(@traversable/bench)
    registry(@traversable/registry)
    data(@traversable/data) -.-> bench(@traversable/bench)
    openapi(@traversable/openapi) -.-> bench(@traversable/bench)
    core(@traversable/core) -.-> data(@traversable/data)
    core(@traversable/core) -.-> bench(@traversable/bench)
    http(@traversable/http) -.-> core(@traversable/core)
    http(@traversable/http) -.depends on.-> data(@traversable/data)
```

From fewest to most dependencies:

<!-- codegen:start -->
- [`@traversable/bench@0.0.1`](./packages/bench) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/bench/CHANGELOG.md)
- [`@traversable/registry@0.0.0`](./packages/registry) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/registry/CHANGELOG.md)
- [`@traversable/data@0.0.2`](./packages/data) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/data/CHANGELOG.md)
- [`@traversable/openapi@0.0.2`](./packages/openapi) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/openapi/CHANGELOG.md)
- [`@traversable/core@0.0.2`](./packages/core) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/core/CHANGELOG.md)
- [`@traversable/http@0.0.2`](./packages/http) - [CHANGELOG](https://github.com/traversable/shared/blob/main/packages/http/CHANGELOG.md)
<!-- codegen:end -->


## creating a new package

To create a package, run:

```shell
$ pnpm workspace:new
```

The command will walk you through a few prompts to make sure it wires things up correctly.

<div align="left">
  <img src="./bin/assets/pnpm-workspace-new-dialog.png" height="248px" />
  <h3>Running the package generator</h3>
</div>


If you choose `private: false`, you can publish the package to the GitHub registry immediately after running `workspace:new`.

**Note:** The name of your package should be **unprefixed** (don't prepend `@traversable/` or `packages/`).

**Note:** Make sure you commit before you run `workspace:new`! Currently the script does not check for collisions, so it will happily wipe any local changes you've made if you make a mistake. **We plan to add guardrails to prevent this in the future**.


## publishing

Any toplevel folder in the `packages` directory whose `package.json` file does not contain `"private": true` is eligible for publishing.


### manually

1. Make a change in the target package
2. Run `pnpm changes` from the monorepo root
3. When prompted, select the target package:

<div align="left">
  <img src="./bin/assets/pnpm-changes-dialog.png" height="248px" />
  <h4 margin-left="64px">Publishing a package</h4>
</div>

4. Commit the markdown file that [changesets](https://github.com/changesets/changesets) generates
5. After you merge, a 2nd PR will be created for you automatically
6. Merge _that_ PR, and a new version will be published [here](https://github.com/traversable/traversable/releases)

> [!NOTE]
> When you publish a package, any local packages that depend on the published package will also be published automatically.
