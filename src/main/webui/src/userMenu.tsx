import {ReactElement, useContext} from "react";
import {ActionIcon, Menu, Tooltip} from "@mantine/core";
import {
    IconLogout,
    IconUser, IconUserCog
} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {ProposalContext} from "./App2.tsx";
import {CLOSE_DELAY, OPEN_DELAY} from "./constants.tsx";

export default
function UserMenu() : ReactElement {

    const {user} = useContext(ProposalContext);
    const navigate = useNavigate();

    return (
        <Menu
            shadow="md"
            width={200}
        >
            <Menu.Target>
                <Tooltip
                    label={"open user menu"}
                    openDelay={OPEN_DELAY}
                    closeDelay={CLOSE_DELAY}
                >
                    <ActionIcon variant={"subtle"}>
                        <IconUser />
                    </ActionIcon>
                </Tooltip>

            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>User Management</Menu.Label>
                <Menu.Item
                    leftSection={<IconUserCog/>}
                    onClick={() => navigate("user/" + user._id + "/management")}
                >
                    Profile
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Log out</Menu.Label>
                <Menu.Item
                    leftSection={<IconLogout/>}
                    component={"a"}
                    href={"/pst/gui/logout"}
                >
                    log out
                </Menu.Item>

            </Menu.Dropdown>
        </Menu>
    )
}