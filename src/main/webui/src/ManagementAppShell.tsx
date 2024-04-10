import {ReactElement, SyntheticEvent} from "react";
import {ActionIcon} from "@mantine/core";
import {IconLicense} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";

export default function ManagementAppShell () : ReactElement {
    const navigate = useNavigate();
    return (
        <>
            <ActionIcon
                color={"pink"}
                variant={"subtle"}
                onClick={(e : SyntheticEvent)=>{e.preventDefault(); navigate("/editor")}}
            >
                <IconLicense />
            </ActionIcon>
        </>
    )
}