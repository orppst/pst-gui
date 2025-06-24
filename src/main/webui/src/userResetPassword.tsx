import {ReactElement, useContext, useState} from "react";
import {Box, Button, PasswordInput, Popover, Progress, Stack, Text, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {IconCheck, IconX} from "@tabler/icons-react";
import {useSubjectMapResourceResetPassword} from "./generated/proposalToolComponents.ts";
import {ProposalContext} from "./App2.tsx";
import {notifyError, notifySuccess} from "./commonPanel/notifications.tsx";
import getErrorMessage from "./errorHandling/getErrorMessage.tsx";

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text
            c={meets ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 12 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export default
function UserResetPassword() : ReactElement {

    const {user} = useContext(ProposalContext);

    const passwordMutate = useSubjectMapResourceResetPassword();

    const [visible, { toggle }] = useDisclosure(false);
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(newPassword)} />
    ));

    const handleUpdatePassword = () => {
        passwordMutate.mutate({
            pathParams: {personId: user._id!},
            body: newPassword,
            //@ts-ignore
            headers: {"Content-Type": "text/plain"}
        }, {
            onSuccess: () => {
                notifySuccess("Password updated", "new password set")
            },
            onError: (error) => {
                notifyError("Password update failed", getErrorMessage(error))
            }
        })
    }

    const strength = getStrength(newPassword);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
    return (
        <Stack>
            <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
                <Popover.Target>
                    <div
                        onFocusCapture={() => setPopoverOpened(true)}
                        onBlurCapture={() => setPopoverOpened(false)}
                    >
                        <PasswordInput
                            withAsterisk
                            label="New password"
                            visible={visible}
                            onVisibilityChange={toggle}
                            placeholder="choose new password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.currentTarget.value)}
                        />
                    </div>
                </Popover.Target>
                <Popover.Dropdown>
                    <Progress color={color} value={strength} size={5} mb="xs" />
                    <PasswordRequirement label="Includes at least 12 characters" meets={newPassword.length > 12} />
                    {checks}
                </Popover.Dropdown>
            </Popover>
            <PasswordInput
                label="Confirm new password"
                visible={visible}
                onVisibilityChange={toggle}
                value={confirmPassword}
                onChange={(event) =>
                    setConfirmPassword(event.currentTarget.value)}
            />
            <Tooltip
                label={ getStrength(newPassword) < 100 ? "Weak password" :
                    confirmPassword !== newPassword ? "Passwords do not match" : "Reset your password"}
            >
                <Button
                    variant={"filled"}
                    onClick={handleUpdatePassword}
                    disabled={getStrength(newPassword) < 100 || confirmPassword !== newPassword}
                >
                    Reset Password
                </Button>
            </Tooltip>
        </Stack>
    );
}