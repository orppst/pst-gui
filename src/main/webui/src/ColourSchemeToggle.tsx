import {useMantineColorScheme, Switch, useMantineTheme} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';
import { Slider } from '@mantine/core';

export function SwitchToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    return (
        <>
            <Switch
                checked={colorScheme === 'dark'}
                onChange={() => toggleColorScheme()}
                size="md"
                onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
                offLabel={<IconMoonStars color={theme.colors.gray[6]} size="1.25rem" stroke={1.5}/>}
            />
            <Slider miw={120}
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