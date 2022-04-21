import {
  handleIncomingRedirect,
  getDefaultSession,
  login as solidLogin,
} from '@inrupt/solid-client-authn-browser'

export const login = async (oidcIssuer: string) =>
  await solidLogin({
    oidcIssuer,
    redirectUrl: globalThis.location.href,
    clientName: 'ditup',
  })

export const init = async () => {
  await handleIncomingRedirect({
    url: globalThis.location.href,
    restorePreviousSession: true,
  })

  return getDefaultSession().info
}

export { logout } from '@inrupt/solid-client-authn-browser'
