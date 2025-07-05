"use server";

import { cookies } from "next/headers";

export async function getCookie() {
  const cookieStore = await cookies();

  const userId = cookieStore.get("userId");
  const name = cookieStore.get("name");
  const role = cookieStore.get("role");

  if (name && role && userId) {
    return {
      name: name.value,
      role: role.value,
      userId: userId.value,
    };
  }

  return undefined;
}
