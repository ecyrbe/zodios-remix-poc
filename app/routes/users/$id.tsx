import { useCatch } from "@remix-run/react";
import z from "zod";
import { checkLoaderContract } from "../../../zodios-remix";
import { useLoaderData } from "../../../zodios-remix/hooks";
import type { ZodiosEndpointDefinition } from "@zodios/core";
import type { Narrow } from "@zodios/core/lib/utils.types";
import type { LoaderArgs } from "@remix-run/node";

function makeContract<T extends ZodiosEndpointDefinition>(
  endpoint: Narrow<T>
): T {
  return endpoint as T;
}

const contract = makeContract({
  method: "get",
  path: "/users/:id",
  parameters: [
    {
      name: "id",
      type: "Path",
      schema: z.number(),
    },
  ],
  response: z.object({
    id: z.number(),
    name: z.string(),
  }),
  errors: [
    {
      status: 404,
      schema: z.object({
        message: z.literal("User not found"),
      }),
    },
  ],
});

export const loader = async (args: LoaderArgs) => {
  const { params, error, json } = await checkLoaderContract(contract, args);
  //                                      ^ check and validate the contract
  if (params.id !== 1) {
    //       ^ coerced to a number
    throw error(404).json({ message: "User not found" });
    //                 ^ only accepts the schema defined in the contract
  }
  // you can try this to show the error boundary
  // // @ts-expect-error
  // return json({ id: params.id, names: "John" });
  //                                ^ bad property name
  return json({ id: params.id, name: "John" });
  //      ^ only accepts the schema defined in the contract
};

export default function User() {
  const user = useLoaderData(contract);
  //     ^ guarenteed to be the schema defined in the contract
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>{user.name}</h1>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  console.error(caught);
  return <div>on catch boundary: {JSON.stringify(caught)} </div>;
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>on error boundary: {error.message}</div>;
}
