import { fetch } from '@inrupt/solid-client-authn-browser'

export const fetchImage = async (uri: string): Promise<string> => {
  const response = await fetch(uri)

  const image = `data:${response.headers.get(
    'content-type',
  )};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
  return image
}
