import {
  ArrowRightIcon,
  CalendarIcon,
  ChatIcon,
  EmailIcon,
  TimeIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Divider,
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
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import type { FC } from "react";
import React from "react";

const navData = [
  // { name: "Admin Home", href: "/admin", icon: InfoOutlineIcon },
  { name: "Calendar", href: "/admin/calendar", icon: CalendarIcon },
  { name: "Availabilities", href: "/admin/availabilities", icon: TimeIcon },
  { name: "Contacts", href: "/admin/contacts", icon: ChatIcon },
  { name: "Bookings", href: "/admin/bookings", icon: EmailIcon },
  { name: "Home", href: "/", icon: ViewIcon, withDividerTop: true },
] satisfies {
  name: string;
  href: string;
  icon: unknown;
  withDividerTop?: true;
}[];

interface Props {}

const AdminNav: FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const navigateTo = (href: string) => () => router.push(href);
  return (
    <>
      <IconButton
        icon={<ArrowRightIcon />}
        aria-label="open drawer navigation menu"
        ref={btnRef}
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
          <DrawerHeader>MeetMeCal Admin</DrawerHeader>

          <DrawerBody>
            <Stack justify="left">
              {navData.map((item) => (
                <React.Fragment key={item.name}>
                  {item.withDividerTop && <Divider />}
                  <Button
                    key={item.name}
                    onClick={navigateTo(item.href)}
                    leftIcon={<item.icon boxSize={6} />}
                    variant="nav"
                    bg={router.pathname === item.href ? "brand.800" : undefined}
                  >
                    {item.name}
                  </Button>
                </React.Fragment>
              ))}
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button onClick={() => signOut()}>Sign Out</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AdminNav;
