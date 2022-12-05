import type { H3Event } from 'h3'
import type { FetchOptions, FetchResponse, FetchError } from 'ofetch'
import { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'
import type { GraphQLError } from 'graphql'

export type GraphqlMiddlewareGraphqlEndpointMethod = (
  event?: H3Event,
  operation?: string,
  operationName?: string,
) => string

export type GraphqlMiddlewareServerFetchOptionsMethod = (
  event?: H3Event,
  operation?: string,
  operationName?: string,
) => FetchOptions

export type GraphqlMiddlewareOnServerResponseMethod = (
  event: H3Event,
  response: FetchResponse<any>,
  operation?: string,
  operationName?: string,
) => any

export type GraphqlMiddlewareOnServerErrorMethod = (
  event: H3Event,
  error: FetchError,
  operation?: string,
  operationName?: string,
) => any

export interface GraphqlMiddlewareConfig {
  /**
   * File glob patterns for the auto import feature.
   *
   * If left empty, no documents are auto imported.
   *
   * @default
   * ```json
   * ["**\/.{gql,graphql}", "!node_modules"]
   * ```
   *
   * @example
   * ```ts
   * // Load .graphql files from pages folder and from a node_modules dependency.
   * const autoImportPatterns = [
   *   './pages/**\/*.graphql',
   *   'node_modules/my_library/dist/**\/*.graphql'
   * ]
   * ```
   */
  autoImportPatterns?: string[]

  /**
   * Additional raw documents to include.
   *
   * Useful if for example you need to generate queries during build time.
   *
   * @default []
   *
   * @example
   * ```ts
   * const documents = [`
   *   query myQuery {
   *     articles {
   *       title
   *       id
   *     }
   *   }`,
   *   ...getGeneratedDocuments()
   * ]
   * ```
   */
  documents?: string[]

  /**
   * Wether the useGraphqlQuery, useGraphqlMutation and useGraphqlState
   * composables should be included.
   *
   * @default ```ts
   * true
   * ```
   */
  includeComposables?: boolean

  /**
   * Enable detailled debugging messages.
   *
   * @default false
   */
  debug?: boolean

  /**
   * The URL of the GraphQL server.
   *
   * You can either provide a string or a method that returns a string.
   * If you provide a method it will be called everytime a GraphQL request is
   * made in the server API handler.
   *
   * @example
   * ```ts
   * function graphqlEndpoint(event, operation, operationName) {
   *   const language = getLanguageFromRequest(event)
   *   return `https://api.example.com/${language}/graphql`
   * }
   * ```
   */
  graphqlEndpoint?: string | GraphqlMiddlewareGraphqlEndpointMethod

  /**
   * The prefix for the server route.
   *
   * @default ```ts
   * "/api/graphql_middleware"
   * ```
   */
  serverApiPrefix?: string

  /**
   * Provide the options for the ofetch request to the GraphQL server.
   *
   * @default undefined
   *
   * @example
   * ```ts
   * import { getHeader } from 'h3'
   *
   * // Pass the cookie from the client request to the GraphQL request.
   * function serverFetchOptions(event, operation, operationName) {
   *   return {
   *     headers: {
   *       Cookie: getHeader(event, 'cookie')
   *     }
   *   }
   * }
   * ```
   */
  serverFetchOptions?: FetchOptions | GraphqlMiddlewareServerFetchOptionsMethod

  /**
   * Handle the response from the GraphQL server.
   *
   * You can alter the response, add additional properties to the data, get
   * and set headers, etc.
   *
   * ```ts
   * import type { H3Event } from 'h3'
   * import type { FetchResponse } from 'ofetch'
   *
   * function onServerResponse(event: H3Event, graphqlResponse: FetchResponse) {
   *   // Set a static header.
   *   event.node.res.setHeader('x-nuxt-custom-header', 'A custom header value')
   *
   *   // Pass the set-cookie header from the GraphQL response to the client.
   *   const setCookie = graphqlResponse.headers.get('set-cookie')
   *   if (setCookie) {
   *     event.node.res.setHeader('set-cookie', setCookie)
   *   }
   *
   *   // Add additional properties to the response.
   *   graphqlResponse._data.__customProperty = ['My', 'values']
   *
   *   // Return the GraphQL response.
   *   return graphqlResponse._data
   * }
   * ```
   */
  onServerResponse?: GraphqlMiddlewareOnServerResponseMethod

  /**
   * Handle a fetch error from the GraphQL request.
   *
   * Note that errors are only thrown for responses that are not status
   * 200-299. See https://github.com/unjs/ofetch#%EF%B8%8F-handling-errors for
   * more information.
   *
   * ```ts
   * import { createError } from 'h3'
   * import type { H3Event } from 'h3'
   * import type { FetchError } from 'ofetch'
   *
   * function onServerError(
   *   event: H3Event,
   *   error: FetchError,
   *   operation: string,
   *   operationName: string,
   * ) {
   *   // Throw a h3 error.
   *   throw createError({
   *     statusCode: 500,
   *     statusMessage: `Couldn't execute GraphQL ${operation} "${operationName}".`,
   *     data: error.message
   *   })
   * }
   * ```
   */
  onServerError?: GraphqlMiddlewareOnServerErrorMethod

  /**
   * Download the GraphQL schema and store it in the
   *
   * @default true
   */
  downloadSchema?: boolean

  /**
   * Path to the GraphQL schema file.
   *
   * If `downloadSchema` is `true`, the downloaded schema is written to this specified path.
   * If `downloadSchema` is `false`, this file must be present in order to generate types.
   *
   * @default './schema.graphql'
   */
  schemaPath?: string

  /**
   * These options are passed to the graphql-codegen method when generating the operations types.
   *
   * {@link https://www.the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations}
   * @default
   * ```ts
   * const codegenConfig = {
   *   exportFragmentSpreadSubTypes: true,
   *   preResolveTypes: true,
   *   skipTypeNameForRoot: true,
   *   skipTypename: true,
   *   useTypeImports: true,
   *   onlyOperationTypes: true,
   *   namingConvention: {
   *     enumValues: 'change-case-all#upperCaseFirst',
   *   },
   * }
   * ```
   */
  codegenConfig?: TypeScriptDocumentsPluginConfig
}

export interface GraphqlMiddlewareState {
  fetchOptions: FetchOptions
}

export type GraphqlMiddlewareDocument = {
  content: string
  isValid?: boolean
  errors?: GraphQLError[]
  filename?: string
  name?: string
  operation?: string
}