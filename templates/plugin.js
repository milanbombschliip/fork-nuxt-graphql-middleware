import { GraphqlMiddlewarePlugin } from '~/modules/nuxt-graphql-middleware'

export default function graphqlMiddlewarePlugin(context, inject) {
  const namespace = "<%= options.namespace || '' %>"
  // TODO: Get the port somehow from the context on SSR.
  const port = process?.env?.NUXT_PORT || '<%= options.port %>'
  // @ts-ignore
  const cacheInBrowser = "<%= options.cacheInBrowser || '' %>" === 'true'
  // @ts-ignore
  const cacheInServer = "<%= options.cacheInServer || '' %>" === 'true'

  let baseURL = namespace
  if (process.server) {
    baseURL = 'http://localhost:' + port + namespace
  }

  const useCache =
    (process.server && cacheInServer) || (process.client && cacheInBrowser)

  const plugin = new GraphqlMiddlewarePlugin(
    baseURL,
    context.req?.headers,
    useCache,
    context
  )

  inject('graphql', plugin)
}
