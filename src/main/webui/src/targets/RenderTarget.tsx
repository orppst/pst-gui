import {CoordSys} from "../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {fetchProposalResourceRemoveTarget, useProposalResourceGetTarget} from "../generated/proposalToolComponents.ts";
import {Box, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";
import {
    CelestialTarget,
    Epoch,
    EquatorialPoint,
    SpaceFrame,
} from "../generated/proposalToolSchemas.ts";
import DeleteButton from '../commonButtons/delete.tsx';

type TargetProps = { proposalCode: number, dbid: number, showRemove: boolean };

export function RenderTarget(props: TargetProps) {
    type PropsEquatorialPoint = {point: EquatorialPoint}
    type PropsCelestialTarget = {obj: CelestialTarget}
    type PropsSpaceSys = {coords: CoordSys}
    type PropsSpaceFrame = {frame: SpaceFrame}
    const queryClient = useQueryClient();
    const [submitting, setSubmitting] = useState(false);
    const {data, error, isLoading} = useProposalResourceGetTarget(
        {pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!,
                },
        });

    if(error) {
        return <Box>Error loading target</Box>
    }

    function EquatorialPoint(props: PropsEquatorialPoint) {
        const Point: EquatorialPoint = props.point;

        //console.log(JSON.stringify(Point, null, 2));

        return (
            <Table>
                <Table.Thead>
                    <Table.Tr><Table.Th colSpan={2}>Coordinates</Table.Th></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                {Point.coordSys?.["@type"] === "coords:SpaceSys"? <SpaceSys coords={Point?.coordSys}/> : (<Table.Tr><Table.Td>`Unknown...`</Table.Td></Table.Tr>)}
                {Point?.coordSys?.frame?.["@type"] === "coords:SpaceFrame"?<SpaceFrame frame={Point?.coordSys?.frame}/>: (<Table.Tr><Table.Td>Unknown frame</Table.Td></Table.Tr>)}
                <Table.Tr>
                    <Table.Td>Latitude</Table.Td>
                    <Table.Td>{Point.lat?.value} {Point.lat?.unit?.value}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Longitude</Table.Td>
                    <Table.Td>{Point.lon?.value} {Point.lon?.unit?.value}</Table.Td>
                </Table.Tr>
                </Table.Tbody>
            </Table>
        )
    }

    function SpaceSys(props: PropsSpaceSys) {
        const Coords = props.coords;
        //console.log(JSON.stringify(Coords));
        return (<Table.Tr><Table.Td>Space System</Table.Td>
            <Table.Td>
                {Coords?.coordSpace?.["@type"] === "coords:CartesianCoordSpace"?<CartesianCoordSpace/>: (`Unknown coord space`)}
            </Table.Td>
        </Table.Tr>);
    }

    function CartesianCoordSpace() {
        return (<>Cartesian Coords Space</>);
    }

    function SpaceFrame(props: PropsSpaceFrame) {
        const frame: SpaceFrame = props.frame;
        return (<Table.Tr><Table.Td>Space Frame Ref</Table.Td><Table.Td>{frame?.spaceRefFrame}</Table.Td></Table.Tr>);

    }

    function Epoch(props: any) {
        const PositionEpoch: Epoch = props.epoch;

        return (
            <Table>
                <Table.Thead>
                    <Table.Tr><Table.Th>Epoch</Table.Th></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr><Table.Td>{PositionEpoch.value}</Table.Td></Table.Tr>
                </Table.Tbody>
            </Table>);
    }
    function CelestialTarget(props: PropsCelestialTarget) {
        const target : CelestialTarget = props.obj;
        //console.log(JSON.stringify(target, null, 2));

        return (
            <Table>
                <Table.Thead>
                    <Table.Tr><Table.Th>Celestial Target</Table.Th></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr><Table.Td>{target.sourceName}</Table.Td></Table.Tr>
                </Table.Tbody>
            </Table>
        )
    }

    //Errors come in as name: "unknown", message: "Network Error" with an object called "stack" that
    // contains the exception and message set in the API when the exception is thrown
    const handleError = (error: { stack: { message: any; }; }) => {
        console.error(error);
        alert(error.stack.message);
        setSubmitting(false);
    }


    function handleRemove() {
        setSubmitting(true);
        fetchProposalResourceRemoveTarget({pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries())
            .catch(handleError);
    }

    const openRemoveModal = () =>
        modals.openConfirmModal({
            title: "Remove target",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove '{data?.sourceName}' from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel"},
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove()
        });

    return (
        <>
            {isLoading?(`Loading...`):
                submitting?(`Removing...`):
                    (
                        <Table>
                            <Table.Tbody>
                            <Table.Tr>
                                <Table.Td valign="top">
                                    {data?.["@type"] === "proposal:CelestialTarget" ?
                                        (<CelestialTarget obj={data}></CelestialTarget>)
                                        : (JSON.stringify(data, null, 2))
                                    }
                                </Table.Td>
                                <Table.Td>
                                    {
                                        // @ts-ignore
                                        data?.sourceCoordinates?.["@type"] === "coords:EquatorialPoint" ?
                                            // @ts-ignore
                                            (<EquatorialPoint point={data?.["sourceCoordinates"]} ></EquatorialPoint>)
                                            // @ts-ignore
                                            : (JSON.stringify(data?.sourceCoordinates, null, 2))
                                    }
                                </Table.Td>
                                <Table.Td valign="top">

                                    <Epoch epoch={// @ts-ignore
                                        data?.positionEpoch}/>
                                </Table.Td>
                            </Table.Tr>
                            {props.showRemove && <tr>
                                <Table.Td colSpan={3} align={"right"}>
                                    <DeleteButton
                                        onClick={openRemoveModal}
                                        toolTipLabel={"Delete the target"}/>
                                </Table.Td></tr>}
                            </Table.Tbody>
                        </Table>
                    )
            }
        </>);

}
