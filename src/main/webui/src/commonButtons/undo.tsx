import {Button, ButtonProps} from "@mantine/core";
import {IconArrowBack} from "@tabler/icons-react";
import {ICON_SIZE} from "../constants.tsx";
import {UseFormReturnType} from "@mantine/form";

export interface UndoButtonProps extends ButtonProps {
    form: UseFormReturnType<any>
}

export default
function UndoButton(props: UndoButtonProps) {
    return (
        <Button
            rightSection={<IconArrowBack size={ICON_SIZE}/>}
            disabled={!props.form.isDirty()}
            onClick={() => props.form.reset()}
            mt={props.mt}
            color={"red"}
        >
            Undo
        </Button>
    )
}