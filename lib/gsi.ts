import cookies from 'js-cookie'

const COOKIE_KEY = 'TMGA2'

const requiredScopeMap = new Map<string, true>()
const waitForScript = loadGoogleScript()
let waitExistingRequest: Promise<string> | undefined

export function getAccessToken(clientId: string, scope: string[], force = false): Promise<string> {
	scope.forEach((entry) => requiredScopeMap.set(entry, true))

	if (waitExistingRequest) {
		const prevRequest = waitExistingRequest
		waitExistingRequest = new Promise((resolve, reject) => {
			prevRequest
				.catch(() => {}) // Hide error from prev (!) promise, it should've been handled in prev getAccessToken call.
				.finally(() => {
					fetchAccessToken(clientId, scope, force).then(resolve).catch(reject)
				})
		})
	} else {
		waitExistingRequest = fetchAccessToken(clientId, scope, force)
	}
	return waitExistingRequest
}

async function fetchAccessToken(clientId: string, scope: string[], force: boolean): Promise<string> {
	if (!force) {
		const tokenData = getCookie()
		if (tokenData && conformScope(tokenData.scope)) {
			return tokenData.access_token
		}
	}

	const tokenData = await query(clientId, scope)
	setCookie(tokenData)
	return tokenData.access_token
}

function query(clientId: string, scope: string[]): Promise<google.accounts.oauth2.TokenResponse> {
	return new Promise((resolve, reject) => {
		waitForScript
			.then(() => {
				const client = google.accounts.oauth2.initTokenClient({
					client_id: clientId,
					scope: scope.join(' '),
					callback: resolve,
					error_callback: reject,
				})
				client.requestAccessToken()
			})
			.catch(reject)
	})
}

function setCookie(tokenData: google.accounts.oauth2.TokenResponse): void {
	const base = btoa(JSON.stringify(tokenData))
	const val = `tm${base}`
	const marginMs = 60 * 1000
	const d = new Date(new Date().getTime() + Number(tokenData.expires_in) * 1000 - marginMs)
	cookies.set(COOKIE_KEY, val, { expires: d })
}

function getCookie(): google.accounts.oauth2.TokenResponse | undefined {
	const v = cookies.get(COOKIE_KEY)
	if (!v) return undefined
	let tokenData: google.accounts.oauth2.TokenResponse
	try {
		tokenData = JSON.parse(atob(v.substring(2)))
	} catch (err) {
		return undefined
	}
	return tokenData
}

function conformScope(scope: string): boolean {
	if (typeof scope !== 'string' || !scope) return false
	const existingScopeMap = new Map<string, true>()
	scope.split(' ').forEach((entry) => existingScopeMap.set(entry, true))
	const requiredScope = Array.from(requiredScopeMap)
	for (let i = 0; i < requiredScope.length; i++) {
		const entry = requiredScope[i][0]
		if (!existingScopeMap.has(entry)) return false
	}
	return true
}

function loadGoogleScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		const googleScriptTag = document.createElement('script')
		googleScriptTag.async = true
		googleScriptTag.onerror = reject
		googleScriptTag.onload = () => resolve()
		googleScriptTag.src = 'https://accounts.google.com/gsi/client'
		document.head.appendChild(googleScriptTag)
	})
}
