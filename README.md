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
