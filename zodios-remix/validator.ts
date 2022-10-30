import type { ZodiosEndpointDefinition } from "@zodios/core";
import z from "zod";

export function isZodType(
  t: z.ZodTypeAny,
  type: z.ZodFirstPartyTypeKind
): boolean {
  if (t._def?.typeName === type) {
    return true;
  }
  if (
    t._def?.typeName === z.ZodFirstPartyTypeKind.ZodEffects &&
    (t as z.ZodEffects<any>)._def.effect.type === "refinement"
  ) {
    return isZodType((t as z.ZodEffects<any>).innerType(), type);
  }
  if (t._def?.innerType) {
    return isZodType(t._def?.innerType, type);
  }
  return false;
}

async function validateParam(schema: z.ZodType<any>, parameter: unknown) {
  if (
    (isZodType(schema, z.ZodFirstPartyTypeKind.ZodNumber) ||
      isZodType(schema, z.ZodFirstPartyTypeKind.ZodBoolean)) &&
    parameter &&
    typeof parameter === "string"
  ) {
    return z
      .preprocess((x) => {
        try {
          return JSON.parse(x as string);
        } catch {
          return x;
        }
      }, schema)
      .safeParseAsync(parameter);
  }
  return schema.safeParseAsync(parameter);
}

export async function validateEndpoint(
  endpoint: ZodiosEndpointDefinition,
  parameters: {
    params: Record<string, unknown>;
    query: Record<string, unknown>;
    headers: Headers;
  }
) {
  const validated = {
    params: {} as Record<string, unknown>,
    query: {} as Record<string, unknown>,
  };
  if (endpoint.parameters) {
    for (let parameter of endpoint.parameters) {
      let schema = parameter.schema;

      switch (parameter.type) {
        case "Path":
          {
            const result = await validateParam(
              schema,
              parameters.params[parameter.name]
            );
            if (!result.success) {
              throw new Response(
                JSON.stringify({
                  context: `path.${parameter.name}`,
                  error: result.error.issues,
                }),
                {
                  status: 400,
                }
              );
            }
            validated.params[parameter.name] = result.data as any;
          }
          break;
        case "Query":
          {
            const result = await validateParam(
              schema,
              parameters.query[parameter.name]
            );
            if (!result.success) {
              throw new Response(
                JSON.stringify({
                  context: `query.${parameter.name}`,
                  error: result.error.issues,
                }),
                {
                  status: 400,
                }
              );
            }
            validated.query[parameter.name] = result.data as any;
          }
          break;
        case "Header":
          {
            const result = await parameter.schema.safeParseAsync(
              parameters.headers.get(parameter.name)
            );
            if (!result.success) {
              throw new Response(
                JSON.stringify({
                  context: `header.${parameter.name}`,
                  error: result.error.issues,
                }),
                {
                  status: 400,
                }
              );
            }
          }
          break;
      }
    }
  }
  return validated;
}
