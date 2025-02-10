import { ReactElement, useContext } from 'react';
import ViewEditButton from "src/commonButtons/viewEdit.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {useNavigate} from "react-router-dom";
import { ProposalContext } from '../../App2';

export default function JustificationsEditModal(justificationProps : JustificationProps)
    : ReactElement {

    const navigate = useNavigate();

    /**
     * routes the user to the new justification page.
     */
    function useContextToHandleAddNew() {
        // update data store with correct justifications and navigate to new
        useContext(ProposalContext).justification = justificationProps.justification;
        useContext(ProposalContext).justificationType = justificationProps.which;
        navigate("new");
    }

    const EditButton = () : ReactElement => {
        return (
            <ViewEditButton
                toolTipLabel={"view/edit " + justificationProps.which + " justification"}
                onClick={useContextToHandleAddNew}
            />
        )
    }

    return (
        <>
            <EditButton/>
        </>
    )
}