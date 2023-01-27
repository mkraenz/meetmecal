import { ArrowRightIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import type { FC } from "react";
import React from "react";

const navData = [
  { name: "Admin Home", href: "/admin" },
  { name: "Availabilities", href: "/admin/availabilities" },
  { name: "Calendar", href: "/admin/calendar" },
  { name: "Contacts", href: "/admin/contacts" },
  { name: "Bookings", href: "/admin/bookings" },
];

interface Props {}

const Nav: FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const navigateTo = (href: string) => () => {
    router.push(href);
  };
  return (
    <>
      <IconButton
        icon={<ArrowRightIcon />}
        aria-label="open drawer navigation menu"
        ref={btnRef}
        colorScheme="teal"
        onClick={onOpen}
        m={{ md: 8, base: 2 }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Admin Navigation</DrawerHeader>

          <DrawerBody>
            <Stack justify="left">
              {navData.map((item) => (
                <Button key={item.name} onClick={navigateTo(item.href)}>
                  {item.name}
                </Button>
              ))}
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Nav;
