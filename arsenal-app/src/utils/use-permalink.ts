import { useHistory, useParams } from 'react-router-dom';

function parsePermalink<T>(permalink: string): T | null {
  try {
      const buffer = Buffer.from(decodeURIComponent(permalink), 'base64');
      return JSON.parse(buffer.toString('utf-8'));
  } catch {
      return null;
  }
}

function createPermalink<T>(model: T): string {
  const json = JSON.stringify(model);
  return encodeURIComponent(Buffer.from(json, 'utf-8').toString('base64'));
}

type RootUrl = string | (() => string);

export function usePermalink<T>(rootUrl: RootUrl, defaultState: T): [T, boolean, (newState: T, rootUrlOverride?: RootUrl) => void] {
  // Get the current permalink router param
  const { permalink } = useParams<{ permalink: string }>();
  const history = useHistory();

  // Parse out any permalink param
  const currentPermalink = parsePermalink<T>(permalink);

  // Determine start state
  const startState = currentPermalink ? { ...defaultState, ...currentPermalink } : defaultState;

  // Return start state and hook to update permalink router param
  return [
    startState,
    !currentPermalink,
    function onStateUpdate(newState: T, rootUrlOverride?: RootUrl) {
      const newPermalink = createPermalink(newState);
      let rootUrlValue = rootUrlOverride || rootUrl;
      let rootUrlResult = (typeof rootUrlValue === 'function' ? rootUrlValue() : rootUrlValue) || '';
      if (!rootUrlResult.endsWith('/')) {
        rootUrlResult += '/';
      }
      history.replace(`${rootUrlResult}${newPermalink}`);
    }
  ];
}