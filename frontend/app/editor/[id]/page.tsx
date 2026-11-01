import React from 'react';
import { INITIAL_PROJECTS } from '../../../lib/mockData';
import EditorClient from './EditorClient';

export function generateStaticParams() {
  return INITIAL_PROJECTS.flatMap((p) => [
    { id: p.projectId },
    ...(p.code ? [{ id: p.code }] : []),
  ]);
}


export default async function EditorPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolved = await Promise.resolve(params);
  return <EditorClient projectId={resolved.id} />;
}
