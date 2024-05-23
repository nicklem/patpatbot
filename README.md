[//]: # (TODO)
[//]: # (- Tests)

# Pat Pat Bot

Codacy pattern doc generator.

Since this is a GH action, all code must be self-contained and ready to be executed in one file.

All compiled files in `dist` are therefore committed.

## Using the GitHub action

## Installing and running locally

1. Set environment variables: `cp .env.example .env` and edit the file
1. Install dependencies: `npm i`
1. Install compiler: `npm i -g @vercel/ncc`
1. Build: `npm run build`
1. Run locally: `npm run start`

## Usage

*   Add prompt files to the `prompts` folder.

    Prompts must be named `<order>-<name>.json`, where order is a number and name is a unique identifier.

* 
