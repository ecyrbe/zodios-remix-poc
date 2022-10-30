import { Outlet } from "@remix-run/react";

export default function Users() {
  return (
    <div>
      <h1>Users</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
