'use strict';

import { SendRecvJSON, withTimeout } from "./common.mjs";

export { KGAnnotationClient };

class KGAnnotationClient 
{
  constructor(origin, queryPath, defaultTimeout)
  {
    this.origin = origin;
    this.queryPath = queryPath;
    this.queryURL = `${origin}${queryPath}`;
    this.defaultTimeout = defaultTimeout
  }

  async annotateGraph(kg, timeout=this.defaultTimeout)
  {
    const res = withTimeout(async () =>
      {
        return SendRecvJSON(this.queryURL, 'POST', {}, kg);
      }, timeout);

    return res;
  }
}
