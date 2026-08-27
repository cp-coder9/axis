import { specForgeCapabilitySnapshot } from '@/lib/specforge/capabilities';

process.stdout.write(JSON.stringify(specForgeCapabilitySnapshot()));
