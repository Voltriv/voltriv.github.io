import{c}from"./button-DpxNp_AM.js";import{r as a,j as r}from"./index-C-E8Yhlv.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],h=c("moon",m),g='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%239ca3af"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24">Image unavailable</text></svg>';function x({src:t,fallbackSrc:o=g,alt:i="",...n}){const[s,e]=a.useState(t);return a.useEffect(()=>{e(t)},[t]),r.jsx("img",{...n,src:s,alt:i,onError:()=>e(o),loading:"lazy",decoding:"async"})}export{x as I,h as M};
