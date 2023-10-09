import {useMantineColorScheme, Group, Switch, useMantineTheme} from '@mantine/core';
import {IconSun, IconMoonStars} from '@tabler/icons-react';

export function SwitchToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    return (
        <Switch
            checked={colorScheme === 'dark'}
            onChange={() => toggleColorScheme()}
            size="md"
            onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
            offLabel={<IconMoonStars color={theme.colors.gray[6]} size="1.25rem" stroke={1.5}/>}
        />
    );
}