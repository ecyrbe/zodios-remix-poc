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
import type { ErrorBuilder, JsonBuilder } from "./builders";

type LoaderParams<Endpoint extends ZodiosEndpointDefinition> = {
  params: ZodiosPathParamsForEndpoint<Endpoint, false>;
  query: ZodiosQueryParamsForEndpoint<Endpoint, false>;
  request: Request;
  context: AppLoadContext;
  error: ErrorBuilder<Endpoint>;
  json: JsonBuilder<Endpoint>;
};

export const checkLoaderContract = async <
  Endpoint extends ZodiosEndpointDefinition
>(
  endpoint: Endpoint,
  args: DataFunctionArgs
): Promise<LoaderParams<Endpoint>> => {
  const validated = await validateEndpoint(endpoint, {
    params: args.params,
    query: qs.parse(args.request.url.split("?")[1] || ""),
    headers: args.request.headers,
  });
  return {
    ...args,
    ...validated,
    error,
    json,
  } as any;
};
