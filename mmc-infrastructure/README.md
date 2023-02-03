# mmc-infrastructure

How to redeploy the NextJS Amplify App (e.g. after changing the build settings)

```sh
aws amplify start-job --app-id $(pulumi stack output amplifyNextAppId) --branch-name $(pulumi stack output amplifyNextAppMainBranchName) --job-type RELEASE
# or use RETRY to rerun a job
```

[Other Job types](https://docs.aws.amazon.com/amplify/latest/APIReference/API_StartJob.html#amplify-StartJob-request-jobType)
