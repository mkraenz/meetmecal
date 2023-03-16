# Meet Me Calendar

short: meetmecal, mmc

## Architecture

[![Architecture](https://raw.githubusercontent.com/mkraenz/meetmecal/main/docs/mmc-architecture-diagram.png)](https://raw.githubusercontent.com/mkraenz/meetmecal/main/docs/mmc-architecture-diagram.png)

## Getting Started

From root run

```sh
cd app
npm ci
# TODO: Currently we still need to setup some infrastructure with SAM (I think?). This should be replaced with Pulumi.
cd ../mmc-infrastructure
npm ci
# provision infrastructure
pulumi up -y
# setup local .env file for app
pulumi stack output localEnvFile --show-secrets > ../app/.env
cd ../app
# start the app
npm run dev
```
