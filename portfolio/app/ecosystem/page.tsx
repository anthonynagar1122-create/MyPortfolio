import { ExperienceCanvas } from '@/components/experience/ExperienceCanvas';

export const metadata = {
  title: 'RouteMaster Ecosystem',
  description: 'Enter the RouteMaster digital headquarters and explore our three product worlds.',
};

export default function EcosystemPage() {
  return (
    <main>
      <ExperienceCanvas initialWorld="headquarters" />
    </main>
  );
}
