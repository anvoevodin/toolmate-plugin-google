# Toolmate Google Plugin

[![npm version](https://badge.fury.io/js/@toolmate%2Fplugin-google.svg)](https://badge.fury.io/js/@toolmate%2Fplugin-google)

The plugin provides your toolmate-based editor with google auth functionality. When calling `getAccessToken()` from Toolmate the user will get a window with authorization via google.

## Setup

In your toolmate-based editor install the plugin:

```sh
npm i @toolmate/plugin-google
```

add it into Toolmate:

```ts
import { addPlugin } from '@toolmate/core'
import { getGooglePlugin } from '@toolmate/plugin-google'

const GOOGLE_PROJECT_CLIENT_ID = 'XXX' // Client ID of a google project that you should create in Google Cloud Console. Your users will be authenticating via this project.

addPlugin(getGooglePlugin(GOOGLE_PROJECT_CLIENT_ID))
```

use in the code:

```ts
import { getAccessToken } from '@toolmate/core'

const accessToken = await getAccessToken('google-auth', { scope: ['email'] })
// Use this accessToken to access google services, your own API etc.
```

Feel free to call `getAccessToken()` as many times as you want at any moment with any scope you need (even if it's different every time) - the plugin will try to handle it in the smartest way and just resolve the promise.
