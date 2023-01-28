import { Button, VStack } from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminLoadingIndicator from "../../components/admin/AdminLoadingIndicator";
import useAdminSession from "../../components/admin/useAdminSession";
import { env } from "../../env/client.mjs";
import { api } from "../../utils/api";

interface Props {}

const Admin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const createMeetings = api.admin.createExampleMeetings.useMutation();

  const seedMeetingTypes = async () => {
    await createMeetings.mutateAsync();
    alert("Meeting Types created");
  };

  if (session.status === "loading") {
    return <AdminLoadingIndicator />;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin MeetMeCal</title>
        <meta
          name="description"
          content={`Book a meeting with ${env.NEXT_PUBLIC_MY_FIRST_NAME}`}
        />
      </Head>
      <VStack as="main" pt={20} gap={4}>
        <Button onClick={seedMeetingTypes}>Seed Meeting Types</Button>
      </VStack>
    </AdminLayout>
  );
};

export default Admin;
