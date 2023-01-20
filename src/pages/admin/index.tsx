import { Button, VStack } from "@chakra-ui/react";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import Head from "next/head";
import AdminLoadingIndicator from "../../components/admin/AdminLoadingIndicator";
import useAdminSession from "../../components/admin/useAdminSession";
import { env } from "../../env/client.mjs";
import { api } from "../../utils/api";

interface Props {}

const Admin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const createMeetings = api.admin.createExampleMeetings.useMutation();
  const createAvailabilities =
    api.admin.createExampleAvailabilities.useMutation();
  const createContactAndToken = api.admin.createExampleContact.useMutation();

  const seedMeetingTypes = async () => {
    await createMeetings.mutateAsync();
    alert("Meeting Types created");
  };
  const seedAvailabilities = async () => {
    await createAvailabilities.mutateAsync();
    alert("Availabilities created");
  };
  const seedContactAndToken = async () => {
    await createContactAndToken.mutateAsync();
    alert("Contact and Token created");
  };

  if (session.status === "loading") {
    return <AdminLoadingIndicator />;
  }

  return (
    <>
      <Head>
        <title>Admin MeetMeCal</title>
        <meta
          name="description"
          content={`Book a meeting with ${env.NEXT_PUBLIC_MY_FIRST_NAME}`}
        />
      </Head>
      <VStack as="main" pt={20} gap={4}>
        <Button onClick={seedMeetingTypes}>Seed Meeting Types</Button>
        <Button onClick={seedAvailabilities}>Seed Availabilities</Button>
        <Button onClick={seedContactAndToken}>Seed Contact and Token</Button>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </VStack>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
};

export default Admin;