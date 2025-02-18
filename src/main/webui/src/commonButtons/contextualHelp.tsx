import {useState} from "react";
import {ActionIcon, Alert, Group, Space, Tooltip} from '@mantine/core';
import {contextualHelpMessages} from "../../public/contextualHelpMessages.jsx";
import {IconHelpHexagon, IconHelpHexagonFilled} from "@tabler/icons-react";
import {ICON_SIZE, OPEN_DELAY} from "../constants.tsx";

export function ContextualHelpButton(props : {messageId : string}) {

    const [showingHelp, setShowingHelp] = useState(false);

    const userLang = "-eng"; // hard-coded for now, ideally captured from user

    const singleMessage =
      contextualHelpMessages.find(aMessage =>
        aMessage.id === props.messageId + userLang
      );

    const displayHelp = singleMessage ? singleMessage.message : "";

    return (
        <>
            <Group justify={"flex-end"}>
                <Tooltip
                    label={showingHelp? "Close Help" : "Show Help"}
                    openDelay={OPEN_DELAY}
                >
                    <ActionIcon
                        color="cyan"
                        variant={"transparent"}
                        onClick={() => {setShowingHelp(!showingHelp)}}
                    >
                        {
                            showingHelp ? <IconHelpHexagonFilled size={ICON_SIZE}/> :
                                <IconHelpHexagon size={ICON_SIZE}/>
                        }
                    </ActionIcon>
                </Tooltip>
            </Group>
            {
                showingHelp &&
                <>
                    <Group justify={"center"}>
                        <Alert maw={"85%"}>
                            {displayHelp}
                        </Alert>
                    </Group>
                    <Space h={"xl"}/>
                </>

            }
        </>
    )
}