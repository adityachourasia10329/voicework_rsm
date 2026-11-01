import React from 'react';
import { INITIAL_PROJECTS } from '../../../lib/mockData';
import EditorClient from './EditorClient';

export function generateStaticParams() {
  return INITIAL_PROJECTS.flatMap((p) => [
    { id: p.projectId },
    ...(p.code ? [{ id: p.code }] : []),
  ]);
}


export default function EditorPage({ params }: { params: { id: string } }) {
  return <EditorClient projectId={params.id} />;
}
