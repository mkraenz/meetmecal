import { Grid, GridItem } from "@chakra-ui/react";
import type { FC, ReactNode } from "react";
import AdminNav from "./AdminNav";

interface Props {
  children: ReactNode;
}

const AdminLayout: FC<Props> = ({ children }) => {
  return (
    <Grid
      templateAreas={{
        md: `"nav main"`,
        base: `"nav"
                "main"`,
      }}
      gridTemplateRows={{ md: "1fr", base: "fit-content(20px) 1fr" }}
      gridTemplateColumns={{ md: "fit-content(0px) 1fr", base: "1fr" }}
      gap="1"
    >
      <GridItem area={"nav"}>
        <AdminNav />
      </GridItem>
      <GridItem area={"main"}>{children}</GridItem>
    </Grid>
  );
};

export default AdminLayout;
