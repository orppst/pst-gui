import { useState} from "react";
import {
    fetchProposalResourceRemoveTarget,
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";
import {
    CelestialTarget, CoordSys,
    Epoch,
    EquatorialPoint, ObjectIdentifier,
    SpaceFrame,
} from "../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";
import AddTargetPanel from "./New";
import {useParams} from "react-router-dom";
import {Box, Button, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";

function TargetPanel() {
    const { selectedProposalCode} = useParams();

    const {  data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
            <Box>
                <Text fz="lg" fw={700}>Add and edit targets</Text>
                <Box>
                    <AddTargetPanel/>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<RenderTarget proposalCode={Number(selectedProposalCode)} row={item} key={item.dbid}/>)
                            } )
                    }
                </Box>
            </Box>
        );
    }

    type TargetProps = { proposalCode: number, row: ObjectIdentifier };

    function RenderTarget(props: TargetProps) {
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
                        targetId: props.row.dbid!,
                    },
            });

        if(error) {
            return <div>Error loading target</div>
        }

        function EquatorialPoint(props: PropsEquatorialPoint) {
            const Point: EquatorialPoint = props.point;

            //console.log(JSON.stringify(Point, null, 2));

            return (
                <Table>
                    <tbody>
                        <tr><th colSpan={2}>Coordinates</th></tr>
                            {Point.coordSys?.["@type"] === "coords:SpaceSys"? <SpaceSys coords={Point?.coordSys}/> : (<tr><td>`Unknown...`</td></tr>)}
                            {Point?.coordSys?.frame?.["@type"] === "coords:SpaceFrame"?<SpaceFrame frame={Point?.coordSys?.frame}/>: (<tr><td>Unknown frame</td></tr>)}
                        <tr>
                            <td>Latitude</td>
                            <td>{Point.lat?.value} {Point.lat?.unit?.value}</td>
                        </tr>
                        <tr>
                            <td>Longitude</td>
                            <td>{Point.lon?.value} {Point.lon?.unit?.value}</td>
                        </tr>
                    </tbody>
                </Table>
            )
        }

        function SpaceSys(props: PropsSpaceSys) {
            const Coords = props.coords;
            //console.log(JSON.stringify(Coords));
            return (<tr><td>Space System</td>
                <td>
                {Coords?.coordSpace?.["@type"] === "coords:CartesianCoordSpace"?<CartesianCoordSpace/>: (`Unknown coord space`)}
                </td>
            </tr>);
        }

        function CartesianCoordSpace() {
            return (<>Cartesian Coords Space</>);
        }

        function SpaceFrame(props: PropsSpaceFrame) {
            const frame = props.frame;
            return (<tr><td>Space Frame Ref</td><td>{frame?.spaceRefFrame}</td></tr>);

        }

        function Epoch(props: any) {
            const PositionEpoch: Epoch = props.epoch;

            return (
                <Table>
                    <tbody>
                    <tr><th>Epoch</th></tr>
                    <tr><td>{PositionEpoch.value}</td></tr>
                    </tbody>
                </Table>);
        }
        function CelestialTarget(props: PropsCelestialTarget) {
            const target = props.obj;
            //console.log(JSON.stringify(target, null, 2));

            return (
                <Table>
                    <tbody>
                    <tr><th>Celestial Target</th></tr>
                    <tr><td>{target.sourceName}</td></tr>
                    </tbody>
                </Table>
            )
        }

        function handleRemove() {
            setSubmitting(true);
            fetchProposalResourceRemoveTarget({pathParams:
                    {
                        proposalCode: props.proposalCode,
                        targetId: props.row.dbid!
                    }})
                .then(()=>setSubmitting(false))
                .then(()=>queryClient.invalidateQueries())
                .catch(console.log);
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
            <Box>
                {isLoading?(`Loading...`):
                    submitting?(`Removing...`):
                    (
                        <Table>
                            <tbody>
                            <tr>
                                <td valign="top">
                                    {data?.["@type"] === "proposal:CelestialTarget" ?
                                        (<CelestialTarget obj={data}></CelestialTarget>)
                                    : (JSON.stringify(data, null, 2))
                                }
                                </td>
                                <td>
                                    {
                                        // @ts-ignore
                                        data?.sourceCoordinates?.["@type"] === "coords:EquatorialPoint" ?
                                        // @ts-ignore
                                        (<EquatorialPoint point={data?.["sourceCoordinates"]} ></EquatorialPoint>)
                                        // @ts-ignore
                                        : (JSON.stringify(data?.sourceCoordinates, null, 2))
                                    }
                                </td>
                                <td valign="top">

                                    <Epoch epoch={// @ts-ignore
                                        data?.positionEpoch}/>
                                </td>
                            </tr>
                            <tr><td colSpan={3} align={"right"}><Button color="red" onClick={openRemoveModal}>Remove</Button></td></tr>
                            </tbody>
                        </Table>
                    )
                }
            </Box>);

}

export default TargetPanel