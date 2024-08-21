import {ReactElement, SyntheticEvent} from "react";
import {ObservationFieldsProps} from "./ObservationFieldsPanel.tsx";
import {Badge, Grid, Select, Stack, TextInput, Tooltip} from "@mantine/core";
import {
    Ellipse,
    EquatorialPoint,
    Field,
    Point1,
    Polygon,
    RealQuantity,
    TargetField
} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {SubmitButton} from "../../commonButtons/save.tsx";
import CancelButton from "src/commonButtons/cancel.tsx";
import {
    fetchProposalResourceAddNewField,
    fetchProposalResourceChangeFieldName
} from "../../generated/proposalToolComponents.ts";
import {useParams, useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";

/**
 * Function to return the "Observation Fields" form to either create a new "Field" or edit an existing one.
 * @param props ObservationFieldProps contains the Field for editing or undefined to create new, and a
 *              closeModal function callback.
 *
 */
export default function ObservationFieldsForm(props: ObservationFieldsProps) : ReactElement {

    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();


    /*
        Developer note: If more Field types are added to the underlying data model then this array
        must be edited to match. There is another Field type named "Point" not listed in this array
        that consist of a member called "centre" with a Java Type of "Coordinate", but I am unsure
        how this differs from the "TargetField" type.3
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

    let newFieldCount = props.fieldNames?.length ?? 0;
    newFieldCount += 1;
    const newFieldName = "Field " + newFieldCount;

    const form = useForm<ObservationFieldValues>({
        validateInputOnBlur: true,
        initialValues: {
            fieldType: props.observationField?.["@type"],
            fieldName: props.observationField?.name ?? newFieldName,
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
                    value.length < 2 ? 'Name must have at least 2 characters' :
                        props.fieldNames?.includes(value) ? 'Name must be unique' :
                        null),
        }
    });

    const fieldTypeSelect = () => (
        <Tooltip
            label={props.observationField ? "Cannot change the Type of an existing Field" : "Pick a Type"}
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
        if (props.observationField) {
            //editing an existing Field

            fetchProposalResourceChangeFieldName({
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    fieldId: props.observationField._id!
                },
                body: values.fieldName,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
                .then(() => queryClient.invalidateQueries())
                .then(() => notifySuccess("Success", "Field name updated"))
                .then(() => props.closeModal!())
                .catch(error => notifyError("Failed to update Field Name", getErrorMessage(error)))

            // add more stuff as we add more Field implementation

        } else {
            //create a new Field

            type FieldToPass = {
                theField: TargetField | Polygon | Ellipse
            }

            let baseField : Field = {
                name: values.fieldName,
                "@type": values.fieldType
            }

            //This code may need some refactoring

            let targetField = baseField as TargetField;

            let fieldToPass : FieldToPass = {
                theField: targetField
            }

            switch (values.fieldType) {
                case 'proposal:Polygon': {
                    let polygonField = baseField as Polygon;
                    polygonField.points = values.polygonPoints;
                    fieldToPass.theField = polygonField;
                    break;
                }
                case 'proposal:Ellipse': {
                    let ellipseField = baseField as Ellipse;
                    ellipseField.semiMajor = values.ellipseSemiMajor;
                    ellipseField.semiMinor = values.ellipseSemiMinor;
                    ellipseField.pAMajor = values.ellipsePAMajor;
                    fieldToPass.theField = ellipseField;
                    break;
                }
            }

            fetchProposalResourceAddNewField({
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: fieldToPass.theField
            })
                .then(() => queryClient.invalidateQueries())
                .then(() => notifySuccess("Success", "New Field created"))
                .then(() => props.closeModal!())
                .catch(error => notifyError("Failed to create new Field", getErrorMessage(error)))
        }
    })
  const navigate = useNavigate();

  function handleCancel(event: SyntheticEvent) {
      event.preventDefault();
      navigate("../",{relative:"path"})
      }

    //Reminder: Once fully implemented remove the type-checking conditions in the Submit disable property
    return (
        <form onSubmit={handleSubmit}>
                                <p> </p>
                                <Grid>
                                  <Grid.Col span={9}></Grid.Col>
            <ContextualHelpButton messageId="MaintObsField" />
            </Grid>
            <Stack>
                {fieldNameTextInput()}
                {fieldTypeSelect()}
                {form.values.fieldType === 'proposal:Polygon' &&
                    <Stack align={'center'}>
                        <Badge bg={"teal"}>
                            Under development: Here you would input a list of points that describe the polygon
                        </Badge>
                        <Badge bg={"red"}>
                            Save unavailable
                        </Badge>
                    </Stack>
                }
                {form.values.fieldType === 'proposal:Ellipse' &&
                    <Stack align={"center"}>
                        <Badge bg={"teal"}>
                            Under development: Here you would define the properties of the ellipse
                        </Badge>
                        <Badge bg={"red"}>
                            Save unavailable
                        </Badge>
                    </Stack>
                }
            </Stack>
            <p> </p>
            <Grid>
                <Grid.Col span={7}></Grid.Col>
                <SubmitButton
                    toolTipLabel={props.observationField ? "Save Changes" : "Save new Field"}
                    label={"Save"}
                    disabled={!form.isDirty() || !form.isValid() ||
                        form.values.fieldType === 'proposal:Ellipse' ||
                        form.values.fieldType === 'proposal:Polygon'}
                        />
                 <CancelButton
                     onClickEvent={handleCancel}
                     toolTipLabel={"Go back without saving"}/>
            </Grid>
        </form>
    )
}