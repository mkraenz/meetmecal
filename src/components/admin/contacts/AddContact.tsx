import { AddIcon, CopyIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Textarea,
  useClipboard,
  useToast,
  VStack,
} from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { api } from "../../../utils/api";

import "react-datepicker/dist/react-datepicker.css";

interface Props {}

const AddContact: FC<Props> = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [invitationLink, setInvitationLink] = useState("");
  const clipboard = useClipboard("");
  const toast = useToast();
  const contacts = api.contactsAdmin.getAll.useQuery();
  const create = api.contactsAdmin.create.useMutation();

  const onSubmit = () => {
    create.mutate(
      {
        name,
        email,
        notes,
      },
      {
        onSuccess: (data) => {
          const link = `${location.protocol}//${location.host}/?token=${data.token.value}`;
          setInvitationLink(link);
          contacts.refetch();
        },
      }
    );
  };

  const handleCopyClicked = () => {
    if (invitationLink) {
      clipboard.setValue(invitationLink);
      clipboard.onCopy();
    } else {
      toast({
        title: "No invitation link to copy",
        status: "error",
      });
    }
  };

  return (
    <VStack gap={2} minW="sm">
      <Heading size="md">Add Contact</Heading>

      <FormControl mt={4} isRequired>
        <FormLabel htmlFor="name" textColor={"gray.300"} mb={1}>
          Name
        </FormLabel>
        <Input
          _focusVisible={{
            borderColor: "brand.500",
          }}
          id="name"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder={"Name"}
          value={name}
        />
      </FormControl>

      <FormControl mt={4}>
        <FormLabel htmlFor="email" textColor={"gray.300"} mb={1}>
          Email address
        </FormLabel>
        <Input
          _focusVisible={{
            borderColor: "brand.500",
          }}
          id="email"
          type="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder={"Email"}
          value={email}
        />
      </FormControl>

      <FormControl mt={4}>
        <FormLabel htmlFor="notes" textColor={"gray.300"} mb={1}>
          Notes
        </FormLabel>
        <Textarea
          id="notes"
          onChange={(e) => setNotes(e.currentTarget.value)}
          placeholder={"Notes"}
          value={notes}
          _focusVisible={{
            borderColor: "brand.500",
          }}
        />
      </FormControl>

      <HStack mt={8} justifyContent="center">
        <Button
          variant="solid"
          ml={4}
          leftIcon={<AddIcon />}
          onClick={onSubmit}
          isLoading={create.isLoading || contacts.isLoading}
        >
          Add
        </Button>
      </HStack>

      <HStack gap={4} minW="sm">
        <FormControl>
          <FormLabel htmlFor="invitationLink" textColor={"gray.300"} mb={1}>
            Invitation Link
          </FormLabel>
          <Input
            _focusVisible={{
              borderColor: "brand.500",
            }}
            contentEditable={"false"}
            id="invitationLink"
            defaultValue={invitationLink || "add contact to generate link..."}
          />
        </FormControl>
        {clipboard.hasCopied ? (
          <Button alignSelf={"flex-end"}>Copied!</Button>
        ) : (
          <IconButton
            onClick={handleCopyClicked}
            isLoading={create.isLoading}
            icon={<CopyIcon />}
            aria-label={"Copy invitation link"}
            alignSelf={"flex-end"}
          />
        )}
      </HStack>
    </VStack>
  );
};

export default AddContact;
