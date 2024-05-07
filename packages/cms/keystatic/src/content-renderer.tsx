import * as React from 'react';

import Markdoc from '@markdoc/markdoc';

export function KeystaticDocumentRenderer({ content }: { content: unknown }) {
  return Markdoc.renderers.react(content as string, React);
}
