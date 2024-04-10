import { Plugin, Auth } from '@toolmate/core'
import { getAccessToken } from './gsi'

const getGoogleAuth = (googleProjectClientId: string): Auth => ({
	id: 'google-auth',
	title: 'Google Auth',
	getAccessToken: (payload: unknown) => {
		if (!payload || typeof payload !== 'object') {
			throw new Error('GoogleAuthPlugin:getAccessToken: payload must be an object')
		}
		if (!('scope' in payload)) throw new Error('GoogleAuthPlugin:getAccessToken: payload have scope property')
		if (!Array.isArray(payload.scope) || !payload.scope.every((item) => typeof item === 'string')) {
			throw new Error('GoogleAuthPlugin:getAccessToken: payload must be an array of strings')
		}
		return getAccessToken(googleProjectClientId, payload.scope)
	},
})

export const getGooglePlugin = (googleProjectClientId: string): Plugin => ({
	auths: [getGoogleAuth(googleProjectClientId)],
})
