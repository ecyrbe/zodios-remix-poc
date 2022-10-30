import { json } from "@remix-run/node";
import type {
  ZodiosEndpointDefinition,
  ZodiosErrorForEndpoint,
  ZodiosResponseForEndpoint,
} from "@zodios/core";

export interface RemixResponse<Data> extends Response {
  json: () => Promise<Data>;
}

export type ErrorBuilder<Endpoint extends ZodiosEndpointDefinition> = <
  StatusCode extends number,
  TEndpoint extends ZodiosEndpointDefinition = Endpoint
>(
  status: StatusCode
) => {
  json: <Data extends ZodiosErrorForEndpoint<TEndpoint, StatusCode>>(
    data: Data,
    init?: Omit<ResponseInit, "status">
  ) => RemixResponse<Data>;
};

export type JsonBuilder<Endpoint extends ZodiosEndpointDefinition> = <
  Data extends ZodiosResponseForEndpoint<Endpoint>
>(
  data: Data,
  init?: ResponseInit
) => RemixResponse<Data>;

export const error = (statusCode: number) => {
  return {
    json: (data: any, init?: ResponseInit) => {
      return json(data, { ...init, status: statusCode });
    },
  };
};
