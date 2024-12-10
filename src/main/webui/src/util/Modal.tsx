import { ContextModalProps } from "@mantine/modals";
import { Text, Button } from "@mantine/core";

const CustomModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps & { innerProps: string }) => (
  <>
    <Text size="sm">{innerProps}</Text>
    <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
      OK
    </Button>
  </>
);
export default CustomModal;