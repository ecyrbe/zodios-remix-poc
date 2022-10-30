import { useCatch } from "@remix-run/react";
import { makeEndpoint } from "@zodios/core";
import { makeLoader } from "../../../zodios-remix";
import { useLoaderData } from "../../../zodios-remix/hooks";
import z from "zod";

const contract = makeEndpoint({
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

export const loader = makeLoader(contract, async ({ params, error, json }) => {
  if (params.id !== 1) {
    throw error(404).json({ message: "User not found" });
  }
  // you can try this to show the error boundary
  // // @ts-expect-error
  // return json({ id: params.id, names: "John" });
  //                                ^ bad property name
  return json({ id: params.id, name: "John" });
});

export default function User() {
  const user = useLoaderData(contract);
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
