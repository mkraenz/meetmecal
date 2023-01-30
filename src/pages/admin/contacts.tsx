import { DeleteIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Link,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminLoadingIndicator from "../../components/admin/AdminLoadingIndicator";
import AddContact from "../../components/admin/contacts/AddContact";
import useAdminSession from "../../components/admin/useAdminSession";
import { api } from "../../utils/api";

interface Props {}

const ContactsAdmin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const contacts = api.contactsAdmin.getAll.useQuery();
  const remove = api.contactsAdmin.remove.useMutation();

  const handleDelete = (id: string) => {
    remove.mutate({ id }, { onSuccess: () => contacts.refetch() });
  };

  if (session.status === "loading") return <AdminLoadingIndicator />;
  return (
    <AdminLayout>
      <Head>
        <title>Admin MeetMeCal - Contacts</title>
      </Head>
      <VStack as="main" pt={20} gap={4} pb={20}>
        <Skeleton
          isLoaded={!contacts.isLoading}
          minH="200px"
          rounded={"lg"}
          minW={"md"}
        >
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Notes</Th>
                  <Th>Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(contacts.data || []).map(({ name, email, notes, id }) => (
                  <Tr key={name}>
                    <Td>{name}</Td>
                    <Td>
                      {email ? (
                        <Link
                          href={`mailto:${email}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                        >
                          {email}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </Td>
                    <Td>{notes}</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete contact"
                        onClick={() => handleDelete(id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Skeleton>
        <AddContact />
      </VStack>
    </AdminLayout>
  );
};

export default ContactsAdmin;
