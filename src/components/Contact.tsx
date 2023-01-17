import { Heading, SlideFade, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import { useAppState } from "../state/app.context";
import { formatDate } from "../utils/date.utils";
import ContactForm from "./ContactForm";

interface Props {
  visible: boolean;
}

const Contact: FC<Props> = ({ visible }) => {
  const { state } = useAppState();

  return (
    <SlideFade
      in={visible}
      offsetX={"200px"}
      hidden={!visible}
      transition={{ enter: { duration: 0.3 } }}
    >
      <VStack gap={2}>
        <VStack>
          <Heading as="h2" size="md">
            {state.meetingType?.displayName}
          </Heading>
          <Heading as="p" size={"sm"}>
            {state.slot && formatDate(state.slot)}
          </Heading>
        </VStack>
        <ContactForm />
      </VStack>
    </SlideFade>
  );
};

export default Contact;
