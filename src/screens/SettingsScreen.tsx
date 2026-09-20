import React from 'react';
import ComingSoonScreen from './ComingSoonScreen';

type Props = { onBack: () => void };

export default function SettingsScreen({ onBack }: Props) {
  return <ComingSoonScreen title="Settings" blurb="Settings updates coming soon" onBack={onBack} />;
}
