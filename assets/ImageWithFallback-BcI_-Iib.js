import{c as o}from"./button-CEkGPZNF.js";import{r as e,j as r}from"./index-BQDcV1jv.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],x=o("map-pin",m);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],f=o("moon",l),d='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%239ca3af"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24">Image unavailable</text></svg>';function p({src:t,fallbackSrc:i=d,alt:n="",...c}){const[s,a]=e.useState(t);return e.useEffect(()=>{a(t)},[t]),r.jsx("img",{...c,src:s,alt:n,onError:()=>a(i),loading:"lazy",decoding:"async"})}export{p as I,f as M,x as a};
