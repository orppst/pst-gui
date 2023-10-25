import {Accordion, Box} from "@mantine/core";
import DeleteButton from "./delete.tsx";
import ViewEditButton from "./viewEdit.tsx";
import CloneButton from "./clone.tsx";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

/*
functions to simplify Accordion controls when we want to include a delete/remove button or
edit-clone-delete buttons. You provide the appropriate functions in the input properties.
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