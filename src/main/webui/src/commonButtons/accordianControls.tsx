import {Accordion, Box} from "@mantine/core";
import DeleteButton from "./delete.tsx";
import ViewEditButton from "./viewEdit.tsx";
import CloneButton from "./clone.tsx";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import {SaveButton} from "./save.tsx";

/*
    functions to simplify Accordion controls when we want to include
    buttons/actions in the control header
 */


export function AccordionDelete(
    props : {
        title: string,
        deleteProps: ButtonInterfaceProps
    }) {
    return (
        <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Accordion.Control>{props.title}</Accordion.Control>
            <DeleteButton {...props.deleteProps} />
        </Box>
    )
}

/*
Note: this uses a 'SaveButton' not a 'SubmitButton'
 */
export function AccordionSaveDelete(
    props: {
        title: string,
        saveProps: ButtonInterfaceProps,
        deleteProps: ButtonInterfaceProps
    }) {
    return (
        <Box style={{display: 'flex', alignItems: 'center'}}>
            <Accordion.Control>{props.title}</Accordion.Control>
            <SaveButton {...props.saveProps}/>
            <DeleteButton {...props.deleteProps}/>
        </Box>
    )
}

export function AccordionEditCloneDelete(
    props: {
        title: string,
        editProps: ButtonInterfaceProps,
        cloneProps: ButtonInterfaceProps,
        deleteProps: ButtonInterfaceProps
    }) {
    return (
        <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Accordion.Control>{props.title}</Accordion.Control>
            <ViewEditButton {...props.editProps}/>
            <CloneButton {...props.cloneProps} />
            <DeleteButton {...props.deleteProps}/>
        </Box>
    )
}

