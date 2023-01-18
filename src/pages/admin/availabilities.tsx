import {
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
import AddAvailability from "../../components/admin/availabilities/AddAvailability";
import { api } from "../../utils/api";
import { formatDateOnly, formatTime } from "../../utils/date.utils";

interface Props {}

const AvailabilitiesAdmin: NextPage<Props> = (props) => {
  const availabilities = api.availabilitiesAdmin.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Admin MeetMeCal - Availabilities</title>
      </Head>
      <VStack as="main" pt={20} gap={4}>
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
                </Tr>
              </Thead>
              <Tbody>
                {(availabilities.data || []).map(({ start, end }) => (
                  <Tr key={start}>
                    <Td>{formatDateOnly(start)}</Td>
                    <Td>{formatTime(start)}</Td>
                    <Td>{formatTime(end)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {/* <Button onClick={availabilities}>Seed Meeting Types</Button> */}
        </Skeleton>
        <AddAvailability />
      </VStack>
    </>
  );
};

export default AvailabilitiesAdmin;
