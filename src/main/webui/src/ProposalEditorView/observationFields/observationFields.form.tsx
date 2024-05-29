import {ReactElement} from "react";
import {ObservationFieldsProps} from "./ObservationFieldsPanel.tsx";
import {Badge, Group, Select, Stack, TextInput, Tooltip} from "@mantine/core";
import {EquatorialPoint, Point1, RealQuantity} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {SubmitButton} from "../../commonButtons/save.tsx";

export default function ObservationFieldsForm(props: ObservationFieldsProps) : ReactElement {

    /*
        Developer note: If more field types are added to the underlying data model then this array
        must be edited to match. There is another field type named "Point" that consist of a member
        called "centre" with a Java Type of "Coordinate", but I am unsure how this differs from the
        "TargetField" type.
     */
    let fieldTypeData: {value: string, label: string, description?: string} [] = [
        {value: 'proposal:TargetField', label: "Target",
            description: "The astronomical target is the field"},
        {value: 'proposal:Polygon', label: "Polygon",
            description: "A list of (lon.,lat.) points describing a polygon on the surface of a sphere"},
        {value: 'proposal:Ellipse', label: "Ellipse",
            description: "An Ellipse defined by the semi-major and semi-minor axes"},
    ]

    interface ObservationFieldValues {
        fieldType: string | undefined,
        fieldName: string | undefined,
        centre?: Point1,
        polygonPoints?: EquatorialPoint[],
        ellipseSemiMajor?: RealQuantity,
        ellipseSemiMinor?: RealQuantity,
        ellipsePAMajor?: RealQuantity
    }


    const form = useForm<ObservationFieldValues>({
        validateInputOnBlur: true,
        initialValues: {
            fieldType: props.observationField?.["@type"],
            fieldName: props.observationField?.name,
            centre: undefined,
            polygonPoints: undefined,
            ellipseSemiMajor: undefined,
            ellipseSemiMinor: undefined,
            ellipsePAMajor: undefined
        },

        validate: {
            fieldType: (value: string | undefined) =>
                (value === undefined ? 'Please select a Field Type' : null),
            fieldName: (value: string | undefined) =>
                (value === undefined ? 'Please give the Field a name' :
                    value.length < 2 ? 'Name must have at least 2 characters' : null),
        }
    });

    const fieldTypeSelect = () => (
        <Tooltip
            label={props.observationField ? "Cannot change the 'Type' of an existing Field" : "pick a type"}
            openDelay={1000}
        >
            <Select
                label={"Field Type"}
                placeholder={"Pick one"}
                data={fieldTypeData}
                disabled={props.observationField !== undefined}
                description={fieldTypeData
                    .find(o => o.value === form.values.fieldType)?.description}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                {...form.getInputProps('fieldType')}
            />
        </Tooltip>
    )

    const fieldNameTextInput = () => (
        <TextInput
            label={"Field Name"}
            placeholder={"Give this field a name"}
            {...form.getInputProps("fieldName")}
        />
    )

    const handleSubmit = form.onSubmit(values => {
        console.log(values)
    })


    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                {fieldNameTextInput()}
                {fieldTypeSelect()}
                {form.values.fieldType === 'proposal:Polygon' &&
                    <Group justify={"center"}>
                        <Badge bg={"orange"}>
                            Under development: Here you would input a list of points that describe the polygon
                        </Badge>
                    </Group>
                }
                {form.values.fieldType === 'proposal:Ellipse' &&
                    <Group justify={"center"}>
                        <Badge bg={"orange"}>
                            Under development: Here you would define the properties of the ellipse
                        </Badge>
                    </Group>
                }
                <SubmitButton
                    toolTipLabel={props.observationField ? "Save Changes" : "Save new Field"}
                    label={"Save"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
            </Stack>
        </form>
    )
}