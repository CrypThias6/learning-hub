import React from 'react';
import ComingSoonScreen from './ComingSoonScreen';

type Props = { onBack: () => void };

export default function LearnScreen({ onBack }: Props) {
  return <ComingSoonScreen title="Learn" blurb="Learn mode is coming soon" onBack={onBack} />;
}
