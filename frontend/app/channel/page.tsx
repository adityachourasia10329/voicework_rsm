'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { OurChannelView } from '../../components/OurChannelView';
import { IngestionModal } from '../../components/IngestionModal';
import { INITIAL_PROJECTS } from '../../lib/mockData';
import { ProjectState } from '../../lib/types';

export default function ChannelPage() {
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);

  const handleProjectCreated = (newProject: ProjectState) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen text-[#F3F4F8] font-sans">
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        activeTab="channel"
        projectCount={projects.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <OurChannelView onOpenIngest={() => setIsIngestOpen(true)} />
      </main>

      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
