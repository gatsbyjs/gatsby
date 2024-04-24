import { memo, type ComponentType, type JSX } from "react";
import { Box, Text } from "ink";
// eslint-disable-next-line @typescript-eslint/naming-convention
import InkSpinner from "ink-spinner";

type ISpinnerProps = {
  text: string;
  statusText?: string | undefined;
};

function _Spinner({ text, statusText }: ISpinnerProps): JSX.Element {
  let label = text;
  if (statusText) {
    label += ` — ${statusText}`;
  }

  return (
    <Box>
      <Text>
        <InkSpinner type='dots' /> {label}
      </Text>
    </Box>
  );
}

export const Spinner: ComponentType<ISpinnerProps> =
  memo<ISpinnerProps>(_Spinner);
