# Meet Me - Personal Meeting Scheduler

## Backend routes

```log
/booker
- .availabilies is the array of availability slots that have already subtracted all existing bookings from the availabilities inserted by the root user. availabilities are ordered.
- availability intervals (slots) are merged to maximum size (e.g. no slot ends at 16:00 and the next slot immediately starts at 16:00. In such case, both slots should be merged).
- only future availabilities are returned.
```

## One-Table Design

### Queries

- get access token by token value
  - model `token`, pk `token#${value}`
- get all contacts
  - model `contact`, pk `contact`
- get a contact by email or name
  - model `contact`, pk `contact`, filterExpression (costs extra but should be alright)
- get all tokens of a contact
  - also: get token of contact by contact id
  - model `token` index `reversekeyindex` pk `token#${contactId}`
- get contact by token value
  - model `token`, pk `token#${value}` -> `item.contactId`
- get all availabilities and meeting types
  - model `availability`, pk `availability`
  - model `booking` pk `booking` (needed to calculate actual availabilities)
  - model `meetingtype`, pk `meetingtype`
- get all bookings
  - model `booking`, pk `booking`
- get all bookings sorted by date
- ? get all upcoming bookings
- get bookings of a contact by contact id
  - model `booking`, gs1pk `token#${contactId}`
- get a booking by id and contact
  - model `booking`, pk `booking`, sk `booking#${contactId}#${id}`

### Mutations

- ~~delete all expired tokens~~
  - happens automatically due to DynamoDB TTL
- ~~delete all availabilities where end is in the past~~
  - automatic due to DynamoDB TTL
- create a booking
  - model `booking`
- create a contact and a token
  - model `contact`
  - model `token`
- update a contact
  - model `contact`, pk `contact`, sk `contact#${id}`
- recreate a token for a contact
  - model `token`
- create an availability
  - model `availability`
- remove an availability
  - model `availability`, pk `availability`, sk `availability#${endInSecs}`
- create a meeting type
  - model `meetingtype`

## T3 Stack

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## T3 Stack - How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Deploy to AWS Amplify Hosting

### Steps

- Create AWS Amplify Hosting (see <https://aws.amazon.com/blogs/mobile/amplify-next-js-13/> )
- If using env vars on nextjs server-side, then change the Amplify build template to

```yaml
---
build:
  commands:
    # enable server-side env vars. seehttps://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html
    - env | grep -e NEXTAUTH_URL -e NEXTAUTH_SECRET -e BACKEND_BASE_URL -e MY_FIRST_NAME -e MY_AWS_USER_ACCESS_KEY_ID -e MY_AWS_USER_ACCESS_KEY_SECRET -e MY_AWS_DYNAMODB_TABLE_NAME -e MY_AWS_REGION -e MY_AWS_COGNITO_CLIENT_ID -e MY_AWS_COGNITO_CLIENT_SECRET -e MY_AWS_COGNITO_ISSUER >> .env.production
    - npm run build
```

- set env vars in Amplify, e.g. via AWS cli v2:

```sh
# get the amplify app id from AWS Console -> Amplify -> App Settings -> General -> App ARN `arn:aws:amplify:us-east-1:xxxxxxxxxx/<APPID>`
# `paste` shell command turns the .env file into a comma-separated single line (as long as there are no empty lines or comments in the .env file)
# WARNING: this completely REPLACES all env vars in amplify
MY_AMPLIFY_APP_ID=<APP_ID>
aws amplify update-app --app-id $MY_AMPLIFY_APP_ID --environment-variables "$(paste -d ',' -s './.env')"
```

- Redeploy the app
- verify app works under the Amplify-defined URL
- Custom Domain setup -> <https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html>
- if you've setup Cognito Authentication before, make sure to include new Callback URLs in Cognito for the new domain
- custom domain name + HTTPS/SSL
  - 2 steps: first verify domain ownership via setting specific CNAME in your domain registrar, then do the same but for the actual domain for Amplify Hosting

### Remarks

- slightly more difficult that Vercel
- can use api routes
- env vars are somewhat annoying to set up in AWS Amplify Hosting
- custom domain including HTTPS/SSL is easy (though instructions are less clear than on Vercel)
- autodeploy from github branch easily set up
