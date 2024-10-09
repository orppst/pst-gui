import {Accordion, Box} from "@mantine/core";
import DeleteButton from "./delete.tsx";
import ViewEditButton from "./viewEdit.tsx";
import CloneButton from "./clone.tsx";
import { ClickButtonInterfaceProps } from './buttonInterfaceProps.tsx';
import {SaveButton} from "./save.tsx";
import RemoveButton from "./remove.tsx";

/*
    functions to simplify Accordion controls when we want to include
    buttons/actions in the control header
 */

export function AccordionRemove(
    props: {
        title: string,
        removeProps: ClickButtonInterfaceProps
    }) {
    return (
        <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Accordion.Control>{props.title}</Accordion.Control>
            <RemoveButton {...props.removeProps} />
        </Box>
    )
}

export function AccordionDelete(
    props : {
        title: string,
        deleteProps: ClickButtonInterfaceProps
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
        saveProps: ClickButtonInterfaceProps,
        deleteProps: ClickButtonInterfaceProps
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
        editProps: ClickButtonInterfaceProps,
        cloneProps: ClickButtonInterfaceProps,
        deleteProps: ClickButtonInterfaceProps
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

