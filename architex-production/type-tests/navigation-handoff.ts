import {
  INITIAL_NAVIGATION_STATE,
  transitionNavigation,
  type NavigationEvent,
  type NavigationState,
} from '@/lib/navigation';
import { ALL_TOOLS } from '@/lib/data';

// Phase 4 guards receive and later dispatch the same complete event.
export function dispatchAfterDirtyGuard(
  dirty: boolean,
  event: NavigationEvent,
  dispatch: (accepted: NavigationEvent) => void,
): boolean {
  if (dirty) return false;
  dispatch(event);
  return true;
}

// Phase 7 consumes the frozen God event variants and the same state type.
const godEvent: NavigationEvent = { type: 'open-god-stage', stage: 'Design' };
const oneNavigationState: NavigationState = transitionNavigation(
  INITIAL_NAVIGATION_STATE,
  godEvent,
  ALL_TOOLS,
);

void oneNavigationState;
