import {CSSObject, MantineTheme} from "@mantine/core";

export const boxListStyles = (theme: MantineTheme): CSSObject => ({
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    padding: theme.spacing.xl,
    margin: theme.spacing.md,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    },
});

export const boxAddNewStyles = (theme: MantineTheme): CSSObject => ({
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0],
    padding: theme.spacing.xl,
    margin: theme.spacing.md,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
});