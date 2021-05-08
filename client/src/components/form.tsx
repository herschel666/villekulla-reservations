import type { FC, FormEvent } from 'react';
import { memo } from 'react';
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  NeutralColors,
} from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

interface Props {
  onSubmit: () => void;
  onReset?: () => void;
  label: string;
  buttonLabel?: string;
}

const form = mergeStyles({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
});

const fieldset = mergeStyles({
  marginBottom: '16px',
  border: `1px solid ${NeutralColors.gray90}`,
});

const formInnerTokens: IStackTokens = {
  childrenGap: 16,
};

const buttonGroupTokens: IStackTokens = {
  childrenGap: 16,
};

export const Form: FC<Props> = memo(
  ({ children, onSubmit, onReset, label, buttonLabel = 'Absenden' }) => {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
    };

    return (
      <form
        method="post"
        onSubmit={handleSubmit}
        onReset={onReset}
        className={form}
      >
        <fieldset className={fieldset}>
          <Text as="legend" variant="large">
            {label}
          </Text>
          <Stack tokens={formInnerTokens}>{children}</Stack>
        </fieldset>
        <Stack
          horizontal={true}
          tokens={buttonGroupTokens}
          horizontalAlign="end"
        >
          {typeof onReset === 'function' && (
            <DefaultButton type="reset">Abbrechen</DefaultButton>
          )}
          <PrimaryButton type="submit">{buttonLabel}</PrimaryButton>
        </Stack>
      </form>
    );
  }
);
