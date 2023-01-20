import { CircularProgress, Text, VStack } from "@chakra-ui/react";
import type { FC } from "react";

interface Props {}

const AdminLoadingIndicator: FC<Props> = (props) => {
  return (
    <VStack mt={20}>
      <Text>Loading or you may not be signed in...</Text>
      <CircularProgress isIndeterminate color="brand.500" />
    </VStack>
  );
};

export default AdminLoadingIndicator;
