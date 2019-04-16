# SignalFx Node.js Google Cloud Function Wrapper

SignalFx Node.js Google Cloud Function Wrapper

## Usage

The SignalFx NodeJS Google Cloud Function Wrapper is a wrapper around an Google Cloud Function NodeJS function handler, used to instrument execution of the function and send metrics to SignalFx.

### Installation

Use the hosted package:
```
{
  "name": "my-module",
  "dependencies": {
    "signalfx-serverless": "^0.0.1"
  }
}
```

Wrap your function handler
```
'use strict';

const SignalFxServerless = require('signalfx-serverless');

exports.handler = SignalFxServerless.gcfWrapper((req, res) => {
  ...
  res.status(200).send("Hello");
});
```

#### Configuring the ingest endpoint

By default, this function wrapper will send to the `us0` realm. If you are
not in this realm you will need to set the `SIGNALFX_INGEST_ENDPOINT` environment
variable to the correct realm ingest endpoint (https://ingest.{REALM}.signalfx.com).
To determine what realm you are in, check your profile page in the SignalFx
web application (click the avatar in the upper right and click My Profile).


### Environment Variables

```
 SIGNALFX_AUTH_TOKEN=signalfx token
```

Optional parameters available:
```
SIGNALFX_SEND_TIMEOUT=milliseconds for signalfx client timeout [1000]

# Change the ingest endpoint URL:
SIGNALFX_INGEST_ENDPOINT=[https://pops.signalfx.com]
```

### Metrics and dimensions sent by the wrapper

The Google Cloud Function wrapper sends the following metrics to SignalFx:

| Metric Name  | Type | Description |
| ------------- | ------------- | ---|
| function.invocations  | Counter  | Count number of Google Cloud Function invocations|
| function.cold_starts  | Counter  | Count number of cold starts|
| function.errors  | Counter  | Count number of errors from underlying Google Cloud Function handler|
| function.duration  | Gauge  | Milliseconds in execution time of underlying Google Cloud Function handler|

The Google Cloud Function wrapper adds the following dimensions to all data points sent to SignalFx:

| Dimension | Description |
| ------------- | ---|
| gcf_region  | Google Cloud Function Region  |
| gcf_project_id | Google Cloud Function Project ID  |
| gcf_function_name  | Google Cloud Function Name |
| gcf_function_version  | Google Cloud Function Version |
| function_wrapper_version  | SignalFx function wrapper qualifier (e.g. signalfx-gcf-0.0.9) |
| metric_source | The literal value of 'gcf_wrapper' |

### Sending a metric from the Google Cloud Function function

```
'use strict';

const SignalFxServerless = require('signalfx-serverless');

exports.handler = SignalFxServerless.gcfWrapper((req, res) => {
  ...
  SignalFxServerless.helper.sendGauge('gauge.name', value);
});
```

### Deployment

Run this command.
```
gcloud functions deploy [FUNCTION_NAME] --entry-point [FUNCTION_ENTRY_POINT] --runtime nodejs6 --trigger-http --set-env-vars PROJECT_ID=[GCF_PROJECT_ID],SIGNALFX_AUTH_TOKEN=[SFX_ACCESS_TOKEN],SIGNALFX_INGEST_ENDPOINT=[SFX_INGEST_ENDPOINT_URL]
```

## Testing

### Testing locally

Use [Google Cloud Function Emulator](https://cloud.google.com/functions/docs/emulator)
to test your function with SignalFx wrapper.

1) Install Google Cloud Function Emulator.
```
npm install -g @google-cloud/functions-emulator
```
2) Run the function locally.
```
functions start
functions deploy [FUNCTION_NAME] --trigger-http
functions call [FUNCTION_NAME]
```

## License

Apache Software License v2. Copyright © 2019 SignalFx
