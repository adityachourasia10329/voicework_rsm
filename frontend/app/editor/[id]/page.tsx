import React from 'react';
import { INITIAL_PROJECTS } from '../../../lib/mockData';
import EditorClient from './EditorClient';

export function generateStaticParams() {
  return INITIAL_PROJECTS.map((p) => ({
    id: p.projectId,
  }));
}

export default function EditorPage({ params }: { params: { id: string } }) {
  return <EditorClient projectId={params.id} />;
}
