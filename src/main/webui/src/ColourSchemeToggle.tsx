import {useMantineColorScheme, Switch, useMantineTheme} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';
import { Slider } from '@mantine/core';
import { GRAY, STROKE } from './constants.tsx';

export function SwitchToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    return (
        <>
            <Switch
                checked={colorScheme === 'dark'}
                onChange={() => toggleColorScheme()}
                size="md"
                onLabel={<IconSun
                    color={theme.white}
                    size="1.25rem"
                    stroke={STROKE} />}
                offLabel={<IconMoonStars
                    color={GRAY}
                    size="1.25rem"
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