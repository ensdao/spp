# SPP Documentation

The goal of this repo is to provide all relevant data for ENS DAO Service Providers in a structure way. It should be used as the source of truth for any SPP dashboard.

## Structure

- Each SPP season has its own folder in the root of the repo, e.g. `spp-2`.
- Each provider has its own folder within the SPP season with the following structure:
  - `proposal.md` - the initial proposal for the season that got approved by the ENS DAO. This file must include basic information about the provider in the frontmatter including `name`, `description`, `logo`, `website`, `twitter`, `github`.
  - `assets/` - any relevant files, like images, for the proposal/updates, e.g. `logo.svg`.
  - `updates/` - the quarterly updates for the provider.
    - `1.md` - the first update for the provider in the given season.
    - ...

## Guidelines

ENS DAO MetaGov stewards are admins of this repo, and responsible for merging PRs from service providers. They should only merge PRs once the formatting is correct, which is partially validated by the CI.
