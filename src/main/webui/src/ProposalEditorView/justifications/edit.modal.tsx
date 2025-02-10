import {ReactElement} from "react";
import ViewEditButton from "src/commonButtons/viewEdit.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {useNavigate} from "react-router-dom";

export default function JustificationsEditModal(justificationProps : JustificationProps)
    : ReactElement {

    const navigate = useNavigate();

    /**
     * routes the user to the new justification page.
     */
    function handleAddNew() {
        // update data store with correct justifications
        navigate("new");
    }

    const EditButton = () : ReactElement => {
        return (
            <ViewEditButton
                toolTipLabel={"view/edit " + justificationProps.which + " justification"}
                onClick={handleAddNew}
            />
        )
    }

    return (
        <>
            <EditButton/>
        </>
    )
}