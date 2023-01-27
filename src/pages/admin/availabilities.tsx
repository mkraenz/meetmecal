import { DeleteIcon } from "@chakra-ui/icons";
import {
  IconButton,
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
import AddAvailability from "../../components/admin/availabilities/AddAvailability";
import useAdminSession from "../../components/admin/useAdminSession";
import { api } from "../../utils/api";
import { formatDateOnly, formatTime } from "../../utils/date.utils";

interface Props {}

const AvailabilitiesAdmin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const availabilities = api.availabilitiesAdmin.getAll.useQuery();
  const removeAvailability = api.availabilitiesAdmin.remove.useMutation();

  const deleteAvailability = (end: string) => {
    removeAvailability.mutate(
      { end },
      {
        onSuccess: () => availabilities.refetch(),
        onError: () => alert("This didn't work as expected. Please try again."),
      }
    );
  };

  if (session.status === "loading") return <AdminLoadingIndicator />;

  return (
    <AdminLayout>
      <Head>
        <title>Admin MeetMeCal - Availabilities</title>
      </Head>
      <VStack as="main" gap={4}>
        <Skeleton
          isLoaded={!availabilities.isLoading}
          minH="200px"
          rounded={"lg"}
          minW={"md"}
        >
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(availabilities.data || []).map(({ start, end }) => (
                  <Tr key={start}>
                    <Td>{formatDateOnly(start)}</Td>
                    <Td>{formatTime(start)}</Td>
                    <Td>{formatTime(end)}</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete availability"
                        onClick={() => deleteAvailability(end)}
                      ></IconButton>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Skeleton>
        <AddAvailability />
      </VStack>
    </AdminLayout>
  );
};

export default AvailabilitiesAdmin;
