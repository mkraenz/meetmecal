import type { UseSessionOptions } from "next-auth/react";
import { signIn, useSession } from "next-auth/react";

const useAdminSession = (optionsOverrides?: UseSessionOptions<true>) => {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
    ...optionsOverrides,
  });
  return session;
};

export default useAdminSession;
