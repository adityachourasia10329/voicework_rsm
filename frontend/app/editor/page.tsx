import React from 'react';
import { INITIAL_PROJECTS } from '../../lib/mockData';
import EditorClient from './[id]/EditorClient';

export default function DefaultEditorPage() {
  // Opens the default workspace session when the user accesses Editor directly
  return <EditorClient projectId={INITIAL_PROJECTS[0].projectId} />;
}
