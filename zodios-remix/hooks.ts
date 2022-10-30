import { useLoaderData as useRemixLoaderData } from "@remix-run/react";
import type {
  ZodiosEndpointDefinition,
  ZodiosResponseForEndpoint,
} from "@zodios/core";
import { useMemo } from "react";

export function useLoaderData<Endpoint extends ZodiosEndpointDefinition>(
  contract: Endpoint
) {
  const data = useRemixLoaderData<ZodiosResponseForEndpoint<Endpoint>>();
  return useMemo(() => {
    const result = contract.response.safeParse(data);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.issues));
    }
    return result.data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]) as typeof data;
}
