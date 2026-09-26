"use client";

import { adminLogout } from "@/app/admin/actions";

export default function LogoutButton() {
  return (
    <button onClick={() => adminLogout()} className="text-danger text-[12.5px] font-semibold">
      Log out
    </button>
  );
}
