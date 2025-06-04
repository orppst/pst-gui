import {useMantineColorScheme, ActionIcon, Tooltip} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';
import {CLOSE_DELAY, OPEN_DELAY} from './constants';

export function ColourSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    return (
        <Tooltip
            label={colorScheme === 'dark' ? 'light mode' : 'dark mode'}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <ActionIcon
                variant={"subtle"}
                onClick={toggleColorScheme}
            >
                {colorScheme === 'dark' ? <IconSun /> : <IconMoonStars/>}
            </ActionIcon>

        </Tooltip>
    );
}