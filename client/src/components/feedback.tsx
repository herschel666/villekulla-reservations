import type { FC } from 'react';
import { MessageBar } from '@fluentui/react';
import type { IMessageBarStyles, MessageBarType } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

interface Props {
  type: MessageBarType;
  className?: string;
}

const feedbackText = mergeStyles({
  fontSize: '14px',
});

const feedbackStyles: IMessageBarStyles = { text: feedbackText };

export const Feedback: FC<Props> = ({ type, className, children }) => (
  <MessageBar
    messageBarType={type}
    styles={feedbackStyles}
    className={className}
  >
    {children}
  </MessageBar>
);
