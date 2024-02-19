import {useMantineColorScheme, Switch, useMantineTheme} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';
import { Slider } from '@mantine/core';
import { STROKE } from './constants.tsx';

export function SwitchToggle() {
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
            <Slider miw={120}
                label={null}
                showLabelOnHover={false}
                defaultValue={100}
                min={70}
                max={130}
                onChange={(value) => {
                    document.documentElement.style.fontSize = `${value}%`;
                }}
            />
        </>
    );
}