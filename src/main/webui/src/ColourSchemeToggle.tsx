import {useMantineColorScheme, Switch, useMantineTheme} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';
import { STROKE } from './constants';

export function ColourSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    // the colour gray used by the tools.
    const theme = useMantineTheme();
    const GRAY = theme.colors.gray[6];

    return (
        <>
            <Switch
                checked={colorScheme === 'dark'}
                onChange={() => toggleColorScheme()}
                size="md"
                onLabel={<IconSun
                    color={theme.white}
                    size="1.25em"
                    stroke={STROKE} />}
                offLabel={<IconMoonStars
                    color={GRAY}
                    size="1.25em"
                    stroke={STROKE}/>}
            />
        </>
    );
}