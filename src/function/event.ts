import { get_or_set } from '@/util/map_util';

const _iframe_event_listeners_map: Map<string, Map<string, Set<Function>>> = new Map();

export function _register_listener(this: Window, event: string, listener: Function): boolean {
  const iframe_id = this.frameElement?.id;
  if (!iframe_id) {
    return false;
  }

  const event_listeners_map = get_or_set(
    _iframe_event_listeners_map,
    iframe_id,
    () => new Map<string, Set<Function>>(),
  );
  const listeners = get_or_set(event_listeners_map, event, () => new Set());

  if (!listeners.has(listener)) {
    return false;
  }
  listeners.add(listener);
  return true;
}

export function _get_map(this: Window): Map<string, Set<Function>> {
  const iframe_id = this.frameElement?.id;
  if (!iframe_id) {
    return new Map();
  }
  return get_or_set(_iframe_event_listeners_map, iframe_id, () => new Map<string, Set<Function>>());
}
