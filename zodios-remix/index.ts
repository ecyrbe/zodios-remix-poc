import type {
  ZodiosEndpointDefinition,
  ZodiosPathParamsForEndpoint,
  ZodiosQueryParamsForEndpoint,
  ZodiosResponseForEndpoint,
} from "@zodios/core";
import { json } from "@remix-run/node";
import type { AppLoadContext, DataFunctionArgs } from "@remix-run/node";
import qs from "qs";
import { validateEndpoint } from "./validator";
import { error } from "./builders";
import type { ErrorBuilder, JsonBuilder, RemixResponse } from "./builders";

type LoaderParams<Endpoint extends ZodiosEndpointDefinition> = {
  params: ZodiosPathParamsForEndpoint<Endpoint, false>;
  query: ZodiosQueryParamsForEndpoint<Endpoint, false>;
  request: Request;
  context: AppLoadContext;
  error: ErrorBuilder<Endpoint>;
  json: JsonBuilder<Endpoint>;
};

//export type LoaderFunction<

export const makeLoader = <Endpoint extends ZodiosEndpointDefinition>(
  endpoint: Endpoint,
  loader: (
    args: LoaderParams<Endpoint>
  ) => Promise<RemixResponse<ZodiosResponseForEndpoint<Endpoint>>>
) => {
  return async ({ params, request, context }: DataFunctionArgs) => {
    const validated = await validateEndpoint(endpoint, {
      params,
      query: qs.parse(request.url.split("?")[1] || ""),
      headers: request.headers,
    });
    return loader({ ...validated, request, context, error, json } as any);
  };
};
