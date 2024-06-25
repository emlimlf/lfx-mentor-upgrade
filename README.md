# jobspring

Copyright The Linux Foundation and each contributor to CommunityBridge.

SPDX-License-Identifier: CC-BY-4.0

## Deployment

Install angular-cli

npm install -g @angular/cli

Uses serverless (w/finch) to deploy to s3

To deploy (after building):

`yarn sls client deploy --stage {{stage}} --no-confirm`

Deployment takes ~40s (deployment clears the s3 buckets and recreates from scratch each time)

After deployment your site should be available at:

http://jobspring-stage-ui.s3-website-us-east-1.amazonaws.com/

# Fixing Mandrill un-Subscriptions

Once upon a time we had the `admin-dev@communitybridge.org` email address accidently unsubscribe from the Mailchimp/Mandrill emails. That means no acceptance or notification emails could be received. Oops! Here's how to fix that using the [Mandrill Rejects API](https://mandrillapp.com/api/docs/rejects.JSON.html):


Get a list of email addresses that have unsubscribed:
```sh
export APIKEY=""
curl -s "https://mandrillapp.com/api/1.0/rejects/list.json?key={$APIKEY}" | jq .[].email
```

To remove a list from the un-Subscribe list:
```sh
curl -s "https://mandrillapp.com/api/1.0/rejects/delete.json?key=$APIKEY" \
  -X POST \
  -d "{
    \"key\":\"$APIKEY\",
    \"email\":\"admin-dev@communitybridge.org\"
  }" | jq
```