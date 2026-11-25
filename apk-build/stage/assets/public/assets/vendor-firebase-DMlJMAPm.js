var ap=Object.defineProperty,cp=Object.defineProperties;var up=Object.getOwnPropertyDescriptors;var Bs=Object.getOwnPropertySymbols,lp=Object.getPrototypeOf,fu=Object.prototype.hasOwnProperty,pu=Object.prototype.propertyIsEnumerable,hp=Reflect.get;var du=(n,e,t)=>e in n?ap(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,G=(n,e)=>{for(var t in e||(e={}))fu.call(e,t)&&du(n,t,e[t]);if(Bs)for(var t of Bs(e))pu.call(e,t)&&du(n,t,e[t]);return n},ue=(n,e)=>cp(n,up(e));var Sr=(n,e)=>{var t={};for(var r in n)fu.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&Bs)for(var r of Bs(n))e.indexOf(r)<0&&pu.call(n,r)&&(t[r]=n[r]);return t};var gn=(n,e,t)=>hp(lp(n),t,e);var _=(n,e,t)=>new Promise((r,s)=>{var i=l=>{try{c(t.next(l))}catch(d){s(d)}},a=l=>{try{c(t.throw(l))}catch(d){s(d)}},c=l=>l.done?r(l.value):Promise.resolve(l.value).then(i,a);c((t=t.apply(n,e)).next())});import{o as dp,R as ua}from"./vendor-C0aHSDoD.js";/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fp=()=>{};var mu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ll=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},pp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Ml={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,l=s+2<n.length,d=l?n[s+2]:0,p=i>>2,m=(i&3)<<4|c>>4;let w=(c&15)<<2|d>>6,V=d&63;l||(V=64,a||(w=64)),r.push(t[p],t[m],t[w],t[V])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Ll(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):pp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||d==null||m==null)throw new mp;const w=i<<2|c>>4;if(r.push(w),d!==64){const V=c<<4&240|d>>2;if(r.push(V),m!==64){const k=d<<6&192|m;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class mp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const gp=function(n){const e=Ll(n);return Ml.encodeByteArray(e,!0)},ii=function(n){return gp(n).replace(/\./g,"")},Ul=function(n){try{return Ml.decodeString(n,!0)}catch(e){}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _p(){if(typeof self!="undefined")return self;if(typeof window!="undefined")return window;if(typeof global!="undefined")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yp=()=>_p().__FIREBASE_DEFAULTS__,Ep=()=>{if(typeof process=="undefined"||typeof mu=="undefined")return;const n=mu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Tp=()=>{if(typeof document=="undefined")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(t){return}const e=n&&Ul(n[1]);return e&&JSON.parse(e)},Si=()=>{try{return fp()||yp()||Ep()||Tp()}catch(n){return}},Fl=n=>{var e,t;return(t=(e=Si())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},wp=n=>{const e=Fl(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Bl=()=>{var n;return(n=Si())==null?void 0:n.config},$l=n=>{var e;return(e=Si())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ql{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ip(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=G({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[ii(JSON.stringify(t)),ii(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function be(){return typeof navigator!="undefined"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function vp(){return typeof window!="undefined"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(be())}function Ap(){var e;const n=(e=Si())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch(t){return!1}}function Rp(){return typeof navigator!="undefined"&&navigator.userAgent==="Cloudflare-Workers"}function Pp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Sp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Vp(){const n=be();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Cp(){return!Ap()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function bp(){try{return typeof indexedDB=="object"}catch(n){return!1}}function Np(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kp="FirebaseError";class Vt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=kp,Object.setPrototypeOf(this,Vt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,us.prototype.create)}}class us{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Dp(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new Vt(s,c,r)}}function Dp(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const a=n.substring(s+2,i),c=e[a];r+=n.substring(t,s)+(c!=null?String(c):`<${a}?>`),t=i+1}return r}catch(t){return n}}function xp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Qt(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(gu(i)&&gu(a)){if(!Qt(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function gu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ls(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function br(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function Nr(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Op(n,e){const t=new Lp(n,e);return t.subscribe.bind(t)}class Lp{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Mp(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Vo),s.error===void 0&&(s.error=Vo),s.complete===void 0&&(s.complete=Vo);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch(a){}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Mp(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Vo(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fe(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tr(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch(e){return!1}}function la(n){return _(this,null,function*(){return(yield fetch(n,{credentials:"include"})).ok})}class Rn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _n="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Up{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new ql;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch(s){}}return this.instancesDeferred.get(t).promise}getImmediate(e){var s;const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(s=e==null?void 0:e.optional)!=null?s:!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Bp(e))try{this.getOrInitializeService({instanceIdentifier:_n})}catch(t){}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch(i){}}}}clearInstance(e=_n){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}delete(){return _(this,null,function*(){const e=Array.from(this.instances.values());yield Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])})}isComponentSet(){return this.component!=null}isInitialized(e=_n){return this.instances.has(e)}getOptions(e=_n){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){var a;const r=this.normalizeInstanceIdentifier(t),s=(a=this.onInitCallbacks.get(r))!=null?a:new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch(i){}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Fp(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch(s){}return r||null}normalizeInstanceIdentifier(e=_n){return this.component?this.component.multipleInstances?e:_n:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Fp(n){return n===_n?void 0:n}function Bp(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Up(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var J;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(J||(J={}));const qp={debug:J.DEBUG,verbose:J.VERBOSE,info:J.INFO,warn:J.WARN,error:J.ERROR,silent:J.SILENT},jp=J.INFO,zp={[J.DEBUG]:"log",[J.VERBOSE]:"log",[J.INFO]:"info",[J.WARN]:"warn",[J.ERROR]:"error"},Hp=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=zp[e];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ha{constructor(e){this.name=e,this._logLevel=jp,this._logHandler=Hp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in J))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?qp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,J.DEBUG,...e),this._logHandler(this,J.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,J.VERBOSE,...e),this._logHandler(this,J.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,J.INFO,...e),this._logHandler(this,J.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,J.WARN,...e),this._logHandler(this,J.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,J.ERROR,...e),this._logHandler(this,J.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Gp(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Gp(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Fo="@firebase/app",_u="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At=new ha("@firebase/app"),Kp="@firebase/app-compat",Qp="@firebase/analytics-compat",Yp="@firebase/analytics",Jp="@firebase/app-check-compat",Xp="@firebase/app-check",Zp="@firebase/auth",em="@firebase/auth-compat",tm="@firebase/database",nm="@firebase/data-connect",rm="@firebase/database-compat",sm="@firebase/functions",im="@firebase/functions-compat",om="@firebase/installations",am="@firebase/installations-compat",cm="@firebase/messaging",um="@firebase/messaging-compat",lm="@firebase/performance",hm="@firebase/performance-compat",dm="@firebase/remote-config",fm="@firebase/remote-config-compat",pm="@firebase/storage",mm="@firebase/storage-compat",gm="@firebase/firestore",_m="@firebase/ai",ym="@firebase/firestore-compat",Em="firebase",Tm="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bo="[DEFAULT]",wm={[Fo]:"fire-core",[Kp]:"fire-core-compat",[Yp]:"fire-analytics",[Qp]:"fire-analytics-compat",[Xp]:"fire-app-check",[Jp]:"fire-app-check-compat",[Zp]:"fire-auth",[em]:"fire-auth-compat",[tm]:"fire-rtdb",[nm]:"fire-data-connect",[rm]:"fire-rtdb-compat",[sm]:"fire-fn",[im]:"fire-fn-compat",[om]:"fire-iid",[am]:"fire-iid-compat",[cm]:"fire-fcm",[um]:"fire-fcm-compat",[lm]:"fire-perf",[hm]:"fire-perf-compat",[dm]:"fire-rc",[fm]:"fire-rc-compat",[pm]:"fire-gcs",[mm]:"fire-gcs-compat",[gm]:"fire-fst",[ym]:"fire-fst-compat",[_m]:"fire-vertex","fire-js":"fire-js",[Em]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hr=new Map,Im=new Map,$o=new Map;function yu(n,e){try{n.container.addComponent(e)}catch(t){At.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Hn(n){const e=n.name;if($o.has(e))return At.debug(`There were multiple attempts to register component ${e}.`),!1;$o.set(e,n);for(const t of Hr.values())yu(t,n);for(const t of Im.values())yu(t,n);return!0}function Vi(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Fe(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vm={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Et=new us("app","Firebase",vm);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Am{constructor(e,t,r){this._isDeleted=!1,this._options=G({},e),this._config=G({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Rn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Et.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nr=Tm;function Rm(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=G({name:Bo,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw Et.create("bad-app-name",{appName:String(s)});if(t||(t=Bl()),!t)throw Et.create("no-options");const i=Hr.get(s);if(i)if(Qt(t,i.options)){if(Qt(r,i.config))return i;throw Et.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw Et.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const a=new $p(s);for(const l of $o.values())a.addComponent(l);const c=new Am(t,r,a);return Hr.set(s,c),c}function jl(n=Bo){const e=Hr.get(n);if(!e&&n===Bo&&Bl())return Rm();if(!e)throw Et.create("no-app",{appName:n});return e}function UI(){return Array.from(Hr.values())}function jt(n,e,t){var a;let r=(a=wm[n])!=null?a:n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const c=[`Unable to register library "${r}" with version "${e}":`];s&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&c.push("and"),i&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),At.warn(c.join(" "));return}Hn(new Rn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pm="firebase-heartbeat-database",Sm=1,Wr="firebase-heartbeat-store";let Co=null;function zl(){return Co||(Co=dp(Pm,Sm,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Wr)}catch(t){}}}}).catch(n=>{throw Et.create("idb-open",{originalErrorMessage:n.message})})),Co}function Vm(n){return _(this,null,function*(){try{const t=(yield zl()).transaction(Wr),r=yield t.objectStore(Wr).get(Hl(n));return yield t.done,r}catch(e){if(e instanceof Vt)At.warn(e.message);else{const t=Et.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});At.warn(t.message)}}})}function Eu(n,e){return _(this,null,function*(){try{const r=(yield zl()).transaction(Wr,"readwrite");yield r.objectStore(Wr).put(e,Hl(n)),yield r.done}catch(t){if(t instanceof Vt)At.warn(t.message);else{const r=Et.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});At.warn(r.message)}}})}function Hl(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cm=1024,bm=30;class Nm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Dm(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}triggerHeartbeat(){return _(this,null,function*(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Tu();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=yield this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>bm){const a=xm(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){At.warn(r)}})}getHeartbeatsHeader(){return _(this,null,function*(){var e;try{if(this._heartbeatsCache===null&&(yield this._heartbeatsCachePromise),((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Tu(),{heartbeatsToSend:r,unsentEntries:s}=km(this._heartbeatsCache.heartbeats),i=ii(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,yield this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return At.warn(t),""}})}}function Tu(){return new Date().toISOString().substring(0,10)}function km(n,e=Cm){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),wu(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),wu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Dm{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}runIndexedDBEnvironmentCheck(){return _(this,null,function*(){return bp()?Np().then(()=>!0).catch(()=>!1):!1})}read(){return _(this,null,function*(){if(yield this._canUseIndexedDBPromise){const t=yield Vm(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}})}overwrite(e){return _(this,null,function*(){var r;if(yield this._canUseIndexedDBPromise){const s=yield this.read();return Eu(this.app,{lastSentHeartbeatDate:(r=e.lastSentHeartbeatDate)!=null?r:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return})}add(e){return _(this,null,function*(){var r;if(yield this._canUseIndexedDBPromise){const s=yield this.read();return Eu(this.app,{lastSentHeartbeatDate:(r=e.lastSentHeartbeatDate)!=null?r:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return})}}function wu(n){return ii(JSON.stringify({version:2,heartbeats:n})).length}function xm(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Om(n){Hn(new Rn("platform-logger",e=>new Wp(e),"PRIVATE")),Hn(new Rn("heartbeat",e=>new Nm(e),"PRIVATE")),jt(Fo,_u,n),jt(Fo,_u,"esm2020"),jt("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Om("");function Wl(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Lm=Wl,Gl=new us("auth","Firebase",Wl());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oi=new ha("@firebase/auth");function Ks(n,...e){oi.logLevel<=J.WARN&&oi.warn(`Auth (${nr}): ${n}`,...e)}function Qs(n,...e){oi.logLevel<=J.ERROR&&oi.error(`Auth (${nr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(n,...e){throw da(n,...e)}function nt(n,...e){return da(n,...e)}function Ci(n,e,t){const r=ue(G({},Lm()),{[e]:t});return new us("auth","Firebase",r).create(e,{appName:n.name})}function ut(n){return Ci(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Kl(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&Ze(n,"argument-error"),Ci(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function da(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Gl.create(n,...e)}function j(n,e,...t){if(!n)throw da(e,...t)}function Tt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Qs(e),new Error(e)}function Rt(n,e){n||Tt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ai(){var n;return typeof self!="undefined"&&((n=self.location)==null?void 0:n.href)||""}function Ql(){return Iu()==="http:"||Iu()==="https:"}function Iu(){var n;return typeof self!="undefined"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mm(){return typeof navigator!="undefined"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ql()||Pp()||"connection"in navigator)?navigator.onLine:!0}function Um(){if(typeof navigator=="undefined")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(e,t){this.shortDelay=e,this.longDelay=t,Rt(t>e,"Short delay should be less than long delay!"),this.isMobile=vp()||Sp()}get(){return Mm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(n,e){Rt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self!="undefined"&&"fetch"in self)return self.fetch;if(typeof globalThis!="undefined"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch!="undefined")return fetch;Tt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self!="undefined"&&"Headers"in self)return self.Headers;if(typeof globalThis!="undefined"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers!="undefined")return Headers;Tt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self!="undefined"&&"Response"in self)return self.Response;if(typeof globalThis!="undefined"&&globalThis.Response)return globalThis.Response;if(typeof Response!="undefined")return Response;Tt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bm=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],$m=new hs(3e4,6e4);function Ct(n,e){return n.tenantId&&!e.tenantId?ue(G({},e),{tenantId:n.tenantId}):e}function _t(i,a,c,l){return _(this,arguments,function*(n,e,t,r,s={}){return Jl(n,s,()=>_(null,null,function*(){let d={},p={};r&&(e==="GET"?p=r:d={body:JSON.stringify(r)});const m=ls(ue(G({},p),{key:n.config.apiKey})).slice(1),w=yield n._getAdditionalHeaders();w["Content-Type"]="application/json",n.languageCode&&(w["X-Firebase-Locale"]=n.languageCode);const V=G({method:e,headers:w},d);return Rp()||(V.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&tr(n.emulatorConfig.host)&&(V.credentials="include"),Yl.fetch()(yield Xl(n,n.config.apiHost,t,m),V)}))})}function Jl(n,e,t){return _(this,null,function*(){n._canInitEmulator=!1;const r=G(G({},Fm),e);try{const s=new jm(n),i=yield Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=yield i.json();if("needConfirmation"in a)throw $s(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[l,d]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw $s(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw $s(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw $s(n,"user-disabled",a);const p=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Ci(n,p,d);Ze(n,p)}}catch(s){if(s instanceof Vt)throw s;Ze(n,"network-request-failed",{message:String(s)})}})}function ds(i,a,c,l){return _(this,arguments,function*(n,e,t,r,s={}){const d=yield _t(n,e,t,r,s);return"mfaPendingCredential"in d&&Ze(n,"multi-factor-auth-required",{_serverResponse:d}),d})}function Xl(n,e,t,r){return _(this,null,function*(){const s=`${e}${t}?${r}`,i=n,a=i.config.emulator?fa(n.config,s):`${n.config.apiScheme}://${s}`;return Bm.includes(t)&&(yield i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(a).toString():a})}function qm(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class jm{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(nt(this.auth,"network-request-failed")),$m.get())})}}function $s(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=nt(n,e,r);return s.customData._tokenResponse=t,s}function vu(n){return n!==void 0&&n.enterprise!==void 0}class zm{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return qm(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}function Hm(n,e){return _(this,null,function*(){return _t(n,"GET","/v2/recaptchaConfig",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wm(n,e){return _(this,null,function*(){return _t(n,"POST","/v1/accounts:delete",e)})}function ci(n,e){return _(this,null,function*(){return _t(n,"POST","/v1/accounts:lookup",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch(e){}}function Gm(n,e=!1){return _(this,null,function*(){const t=fe(n),r=yield t.getIdToken(e),s=pa(r);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Lr(bo(s.auth_time)),issuedAtTime:Lr(bo(s.iat)),expirationTime:Lr(bo(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}})}function bo(n){return Number(n)*1e3}function pa(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Qs("JWT malformed, contained fewer than 3 sections"),null;try{const s=Ul(t);return s?JSON.parse(s):(Qs("Failed to decode base64 JWT payload"),null)}catch(s){return Qs("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Au(n){const e=pa(n);return j(e,"internal-error"),j(typeof e.exp!="undefined","internal-error"),j(typeof e.iat!="undefined","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wn(n,e,t=!1){return _(this,null,function*(){if(t)return e;try{return yield e}catch(r){throw r instanceof Vt&&Km(r)&&n.auth.currentUser===n&&(yield n.auth.signOut()),r}})}function Km({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qm{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!=null?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(()=>_(this,null,function*(){yield this.iteration()}),t)}iteration(){return _(this,null,function*(){try{yield this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Lr(this.lastLoginAt),this.creationTime=Lr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ui(n){return _(this,null,function*(){var m;const e=n.auth,t=yield n.getIdToken(),r=yield Wn(n,ci(e,{idToken:t}));j(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(m=s.providerUserInfo)!=null&&m.length?Zl(s.providerUserInfo):[],a=Jm(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),d=c?l:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new qo(s.createdAt,s.lastLoginAt),isAnonymous:d};Object.assign(n,p)})}function Ym(n){return _(this,null,function*(){const e=fe(n);yield ui(e),yield e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)})}function Jm(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Zl(n){return n.map(r=>{var s=r,{providerId:e}=s,t=Sr(s,["providerId"]);return{providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xm(n,e){return _(this,null,function*(){const t=yield Jl(n,{},()=>_(null,null,function*(){const r=ls({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=yield Xl(n,s,"/v1/token",`key=${i}`),c=yield n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&tr(n.emulatorConfig.host)&&(l.credentials="include"),Yl.fetch()(a,l)}));return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}})}function Zm(n,e){return _(this,null,function*(){return _t(n,"POST","/v2/accounts:revokeToken",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken!="undefined","internal-error"),j(typeof e.refreshToken!="undefined","internal-error");const t="expiresIn"in e&&typeof e.expiresIn!="undefined"?Number(e.expiresIn):Au(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=Au(e);this.updateTokensAndExpiration(e,null,t)}getToken(e,t=!1){return _(this,null,function*(){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(yield this.refresh(e,this.refreshToken),this.accessToken):null)})}clearRefreshToken(){this.refreshToken=null}refresh(e,t){return _(this,null,function*(){const{accessToken:r,refreshToken:s,expiresIn:i}=yield Xm(e,t);this.updateTokensAndExpiration(r,s,Number(i))})}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Bn;return r&&(j(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(j(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Bn,this.toJSON())}_performRefresh(){return Tt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lt(n,e){j(typeof n=="string"||typeof n=="undefined","internal-error",{appName:e})}class tt{constructor(i){var a=i,{uid:e,auth:t,stsTokenManager:r}=a,s=Sr(a,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Qm(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new qo(s.createdAt||void 0,s.lastLoginAt||void 0)}getIdToken(e){return _(this,null,function*(){const t=yield Wn(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,yield this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t})}getIdTokenResult(e){return Gm(this,e)}reload(){return Ym(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>G({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new tt(ue(G({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}_updateTokensIfNecessary(e,t=!1){return _(this,null,function*(){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&(yield ui(this)),yield this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)})}delete(){return _(this,null,function*(){if(Fe(this.auth.app))return Promise.reject(ut(this.auth));const e=yield this.getIdToken();return yield Wn(this,Wm(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()})}toJSON(){return ue(G({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>G({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var Z,re,ke,ge,_e,v,g,E;const r=(Z=t.displayName)!=null?Z:void 0,s=(re=t.email)!=null?re:void 0,i=(ke=t.phoneNumber)!=null?ke:void 0,a=(ge=t.photoURL)!=null?ge:void 0,c=(_e=t.tenantId)!=null?_e:void 0,l=(v=t._redirectEventId)!=null?v:void 0,d=(g=t.createdAt)!=null?g:void 0,p=(E=t.lastLoginAt)!=null?E:void 0,{uid:m,emailVerified:w,isAnonymous:V,providerData:k,stsTokenManager:U}=t;j(m&&U,e,"internal-error");const M=Bn.fromJSON(this.name,U);j(typeof m=="string",e,"internal-error"),Lt(r,e.name),Lt(s,e.name),j(typeof w=="boolean",e,"internal-error"),j(typeof V=="boolean",e,"internal-error"),Lt(i,e.name),Lt(a,e.name),Lt(c,e.name),Lt(l,e.name),Lt(d,e.name),Lt(p,e.name);const K=new tt({uid:m,auth:e,email:s,emailVerified:w,displayName:r,isAnonymous:V,photoURL:a,phoneNumber:i,tenantId:c,stsTokenManager:M,createdAt:d,lastLoginAt:p});return k&&Array.isArray(k)&&(K.providerData=k.map(A=>G({},A))),l&&(K._redirectEventId=l),K}static _fromIdTokenResponse(e,t,r=!1){return _(this,null,function*(){const s=new Bn;s.updateFromServerResponse(t);const i=new tt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return yield ui(i),i})}static _fromGetAccountInfoResponse(e,t,r){return _(this,null,function*(){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Zl(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Bn;c.updateFromIdToken(r);const l=new tt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new qo(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,d),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ru=new Map;function wt(n){Rt(n instanceof Function,"Expected a class definition");let e=Ru.get(n);return e?(Rt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Ru.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(){this.type="NONE",this.storage={}}_isAvailable(){return _(this,null,function*(){return!0})}_set(e,t){return _(this,null,function*(){this.storage[e]=t})}_get(e){return _(this,null,function*(){const t=this.storage[e];return t===void 0?null:t})}_remove(e){return _(this,null,function*(){delete this.storage[e]})}_addListener(e,t){}_removeListener(e,t){}}eh.type="NONE";const Pu=eh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ys(n,e,t){return`firebase:${n}:${e}:${t}`}class wn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Ys(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ys("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch(a){}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}getCurrentUser(){return _(this,null,function*(){const e=yield this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=yield ci(this.auth,{idToken:e}).catch(()=>{});return t?tt._fromGetAccountInfoResponse(this.auth,t,e):null}return tt._fromJSON(this.auth,e)})}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}setPersistence(e){return _(this,null,function*(){if(this.persistence===e)return;const t=yield this.getCurrentUser();if(yield this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)})}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch(e){}}static create(e,t,r="authUser"){return _(this,null,function*(){if(!t.length)return new wn(wt(Pu),e,r);const s=(yield Promise.all(t.map(d=>_(null,null,function*(){try{if(yield d._isAvailable())return d}catch(p){return}})))).filter(d=>d);let i=s[0]||wt(Pu);const a=Ys(r,e.config.apiKey,e.name);let c=null;for(const d of t)try{const p=yield d._get(a);if(p){let m;if(typeof p=="string"){const w=yield ci(e,{idToken:p}).catch(()=>{});if(!w)break;m=yield tt._fromGetAccountInfoResponse(e,w,p)}else m=tt._fromJSON(e,p);d!==i&&(c=m),i=d;break}}catch(p){}const l=s.filter(d=>d._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new wn(i,e,r):(i=l[0],c&&(yield i._set(a,c.toJSON())),yield Promise.all(t.map(d=>_(null,null,function*(){if(d!==i)try{yield d._remove(a)}catch(p){}}))),new wn(i,e,r))})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Su(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(sh(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(th(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(oh(e))return"Blackberry";if(ah(e))return"Webos";if(nh(e))return"Safari";if((e.includes("chrome/")||rh(e))&&!e.includes("edge/"))return"Chrome";if(ih(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function th(n=be()){return/firefox\//i.test(n)}function nh(n=be()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function rh(n=be()){return/crios\//i.test(n)}function sh(n=be()){return/iemobile/i.test(n)}function ih(n=be()){return/android/i.test(n)}function oh(n=be()){return/blackberry/i.test(n)}function ah(n=be()){return/webos/i.test(n)}function ma(n=be()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function eg(n=be()){var e;return ma(n)&&!!((e=window.navigator)!=null&&e.standalone)}function tg(){return Vp()&&document.documentMode===10}function ch(n=be()){return ma(n)||ih(n)||ah(n)||oh(n)||/windows phone/i.test(n)||sh(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uh(n,e=[]){let t;switch(n){case"Browser":t=Su(be());break;case"Worker":t=`${Su(be())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${nr}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ng{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const l=e(i);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}runMiddleware(e){return _(this,null,function*(){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)yield r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch(i){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}})}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rg(t){return _(this,arguments,function*(n,e={}){return _t(n,"GET","/v2/passwordPolicy",Ct(n,e))})}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sg=6;class ig{constructor(e){var r,s,i,a;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(r=t.minPasswordLength)!=null?r:sg,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))!=null?i:"",this.forceUpgradeOnSignin=(a=e.forceUpgradeOnSignin)!=null?a:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var r,s,i,a,c,l;const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=(r=t.meetsMinPasswordLength)!=null?r:!0),t.isValid&&(t.isValid=(s=t.meetsMaxPasswordLength)!=null?s:!0),t.isValid&&(t.isValid=(i=t.containsLowercaseLetter)!=null?i:!0),t.isValid&&(t.isValid=(a=t.containsUppercaseLetter)!=null?a:!0),t.isValid&&(t.isValid=(c=t.containsNumericCharacter)!=null?c:!0),t.isValid&&(t.isValid=(l=t.containsNonAlphanumericCharacter)!=null?l:!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Vu(this),this.idTokenSubscription=new Vu(this),this.beforeStateQueue=new ng(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Gl,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=wt(t)),this._initializationPromise=this.queue(()=>_(this,null,function*(){var r,s,i;if(!this._deleted){try{this.persistenceManager=yield wn.create(this,e)}catch(a){Ks(`Failed to initialize persistence: ${a}`),this.persistenceManager=yield wn.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{yield this._popupRedirectResolver._initialize(this)}catch(a){}try{yield this.initializeCurrentUser(t)}catch(a){Ks(`Failed to initialize current user: ${a}`),yield this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}})),this._initializationPromise}_onStorageEvent(){return _(this,null,function*(){if(this._deleted)return;const e=yield this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),yield this.currentUser.getIdToken();return}yield this._updateCurrentUser(e,!0)}})}initializeCurrentUserFromIdToken(e){return _(this,null,function*(){try{const t=yield ci(this,{idToken:e}),r=yield tt._fromGetAccountInfoResponse(this,t,e);yield this.directlySetCurrentUser(r)}catch(t){yield this.directlySetCurrentUser(null)}})}initializeCurrentUser(e){return _(this,null,function*(){var i;if(Fe(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=yield this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){yield this.getOrInitRedirectPersistenceManager();const a=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=yield this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{yield this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),yield this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)})}tryRedirectSignIn(e){return _(this,null,function*(){let t=null;try{t=yield this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(r){yield this._setRedirectUser(null)}return t})}reloadAndSetCurrentUserOrClear(e){return _(this,null,function*(){try{yield ui(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)})}useDeviceLanguage(){this.languageCode=Um()}_delete(){return _(this,null,function*(){this._deleted=!0})}updateCurrentUser(e){return _(this,null,function*(){if(Fe(this.app))return Promise.reject(ut(this));const t=e?fe(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))})}_updateCurrentUser(e,t=!1){return _(this,null,function*(){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||(yield this.beforeStateQueue.runMiddleware(e)),this.queue(()=>_(this,null,function*(){yield this.directlySetCurrentUser(e),this.notifyAuthListeners()}))})}signOut(){return _(this,null,function*(){return Fe(this.app)?Promise.reject(ut(this)):(yield this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&(yield this._setRedirectUser(null)),this._updateCurrentUser(null,!0))})}setPersistence(e){return Fe(this.app)?Promise.reject(ut(this)):this.queue(()=>_(this,null,function*(){yield this.assertedPersistence.setPersistence(wt(e))}))}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}validatePassword(e){return _(this,null,function*(){this._getPasswordPolicyInternal()||(yield this._updatePasswordPolicy());const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)})}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}_updatePasswordPolicy(){return _(this,null,function*(){const e=yield rg(this),t=new ig(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t})}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new us("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}revokeAccessToken(e){return _(this,null,function*(){if(this.currentUser){const t=yield this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),yield Zm(this,r)}})}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}_setRedirectUser(e,t){return _(this,null,function*(){const r=yield this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)})}getOrInitRedirectPersistenceManager(e){return _(this,null,function*(){if(!this.redirectPersistenceManager){const t=e&&wt(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=yield wn.create(this,[wt(t._redirectPersistence)],"redirectUser"),this.redirectUser=yield this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager})}_redirectUserForId(e){return _(this,null,function*(){var t,r;return this._isInitialized&&(yield this.queue(()=>_(this,null,function*(){}))),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null})}_persistUserIfCurrent(e){return _(this,null,function*(){if(e===this.currentUser)return this.queue(()=>_(this,null,function*(){return this.directlySetCurrentUser(e)}))})}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t,r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=(r=(t=this.currentUser)==null?void 0:t.uid)!=null?r:null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}).catch(l=>{if(!a)if(typeof t!="function"&&t.error)t.error(l);else if(r)r(l);else throw l}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}directlySetCurrentUser(e){return _(this,null,function*(){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?yield this.persistenceManager.setCurrentUser(e):yield this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),s=Ci(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw s.customData={originalError:t},s}})}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=uh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}_getAdditionalHeaders(){return _(this,null,function*(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=yield(s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const r=yield this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e})}_getAppCheckToken(){return _(this,null,function*(){var t;if(Fe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=yield(t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken();return e!=null&&e.error&&Ks(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token})}}function yt(n){return fe(n)}class Vu{constructor(e){this.auth=e,this.observer=null,this.addObserver=Op(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bi={loadJS(){return _(this,null,function*(){throw new Error("Unable to load external scripts")})},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ag(n){bi=n}function lh(n){return bi.loadJS(n)}function cg(){return bi.recaptchaEnterpriseScript}function ug(){return bi.gapiScript}function lg(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class hg{constructor(){this.enterprise=new dg}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class dg{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fg="recaptcha-enterprise",hh="NO_RECAPTCHA",Cu="onFirebaseAuthREInstanceReady";class Mt{constructor(e){this.type=fg,this.auth=yt(e)}verify(e="verify",t=!1){return _(this,null,function*(){function r(i){return _(this,null,function*(){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise((a,c)=>_(null,null,function*(){Hm(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const d=new zm(l);return i.tenantId==null?i._agentRecaptchaConfig=d:i._tenantRecaptchaConfigs[i.tenantId]=d,a(d.siteKey)}}).catch(l=>{c(l)})}))})}function s(i,a,c){const l=window.grecaptcha;vu(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(d=>{a(d)}).catch(()=>{a(hh)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new hg().execute("siteKey",{action:"verify"}):new Promise((i,a)=>{r(this.auth).then(c=>_(this,null,function*(){if(!t&&vu(window.grecaptcha)&&Mt.scriptInjectionDeferred)yield Mt.scriptInjectionDeferred.promise,s(c,i,a);else{if(typeof window=="undefined"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=cg();l.length!==0&&(l+=c+`&onload=${Cu}`),Mt.scriptInjectionDeferred=new ql,window[Cu]=()=>{var d;(d=Mt.scriptInjectionDeferred)==null||d.resolve()},lh(l).then(()=>{var d;return(d=Mt.scriptInjectionDeferred)==null?void 0:d.promise}).then(()=>{s(c,i,a)}).catch(d=>{a(d)})}})).catch(c=>{a(c)})})})}}Mt.scriptInjectionDeferred=null;function bu(n,e,t,r=!1,s=!1){return _(this,null,function*(){const i=new Mt(n);let a;if(s)a=hh;else try{a=yield i.verify(t)}catch(l){a=yield i.verify(t,!0)}const c=G({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,d=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:d,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c})}function jo(n,e,t,r,s){return _(this,null,function*(){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=yield bu(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(a=>_(null,null,function*(){if(a.code==="auth/missing-recaptcha-token"){const c=yield bu(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)}))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pg(n,e){const t=Vi(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Qt(i,e!=null?e:{}))return s;Ze(s,"already-initialized")}return t.initialize({options:e})}function mg(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(wt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function gg(n,e,t){const r=yt(n);j(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=dh(e),{host:a,port:c}=_g(e),l=c===null?"":`:${c}`,d={url:`${i}//${a}${l}/`},p=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){j(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),j(Qt(d,r.config.emulator)&&Qt(p,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=d,r.emulatorConfig=p,r.settings.appVerificationDisabledForTesting=!0,tr(a)?la(`${i}//${a}${l}`):yg()}function dh(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function _g(n){const e=dh(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Nu(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Nu(a)}}}function Nu(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function yg(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof window!="undefined"&&typeof document!="undefined"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Tt("not implemented")}_getIdTokenResponse(e){return Tt("not implemented")}_linkToIdToken(e,t){return Tt("not implemented")}_getReauthenticationResolver(e){return Tt("not implemented")}}function Eg(n,e){return _(this,null,function*(){return _t(n,"POST","/v1/accounts:signUp",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tg(n,e){return _(this,null,function*(){return ds(n,"POST","/v1/accounts:signInWithPassword",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wg(n,e){return _(this,null,function*(){return ds(n,"POST","/v1/accounts:signInWithEmailLink",Ct(n,e))})}function Ig(n,e){return _(this,null,function*(){return ds(n,"POST","/v1/accounts:signInWithEmailLink",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr extends ga{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Gr(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Gr(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}_getIdTokenResponse(e){return _(this,null,function*(){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return jo(e,t,"signInWithPassword",Tg);case"emailLink":return wg(e,{email:this._email,oobCode:this._password});default:Ze(e,"internal-error")}})}_linkToIdToken(e,t){return _(this,null,function*(){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return jo(e,r,"signUpPassword",Eg);case"emailLink":return Ig(e,{idToken:t,email:this._email,oobCode:this._password});default:Ze(e,"internal-error")}})}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $n(n,e){return _(this,null,function*(){return ds(n,"POST","/v1/accounts:signInWithIdp",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vg="http://localhost";class Pn extends ga{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Pn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ze("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const c=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=c,i=Sr(c,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Pn(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return $n(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,$n(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,$n(e,t)}buildRequest(){const e={requestUri:vg,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ls(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ag(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Rg(n){const e=br(Nr(n)).link,t=e?br(Nr(e)).deep_link_id:null,r=br(Nr(n)).deep_link_id;return(r?br(Nr(r)).link:null)||r||t||e||n}class _a{constructor(e){var a,c,l,d,p,m;const t=br(Nr(e)),r=(a=t.apiKey)!=null?a:null,s=(c=t.oobCode)!=null?c:null,i=Ag((l=t.mode)!=null?l:null);j(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=(d=t.continueUrl)!=null?d:null,this.languageCode=(p=t.lang)!=null?p:null,this.tenantId=(m=t.tenantId)!=null?m:null}static parseLink(e){const t=Rg(e);try{return new _a(t)}catch(r){return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr{constructor(){this.providerId=rr.PROVIDER_ID}static credential(e,t){return Gr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=_a.parseLink(t);return j(r,"argument-error"),Gr._fromEmailAndCode(e,r.code,r.tenantId)}}rr.PROVIDER_ID="password";rr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";rr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ni{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs extends Ni{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut extends fs{constructor(){super("facebook.com")}static credential(e){return Pn._fromParams({providerId:Ut.PROVIDER_ID,signInMethod:Ut.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ut.credentialFromTaggedObject(e)}static credentialFromError(e){return Ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ut.credential(e.oauthAccessToken)}catch(t){return null}}}Ut.FACEBOOK_SIGN_IN_METHOD="facebook.com";Ut.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft extends fs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Pn._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ft.credential(t,r)}catch(s){return null}}}Ft.GOOGLE_SIGN_IN_METHOD="google.com";Ft.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt extends fs{constructor(){super("github.com")}static credential(e){return Pn._fromParams({providerId:Bt.PROVIDER_ID,signInMethod:Bt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Bt.credentialFromTaggedObject(e)}static credentialFromError(e){return Bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Bt.credential(e.oauthAccessToken)}catch(t){return null}}}Bt.GITHUB_SIGN_IN_METHOD="github.com";Bt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t extends fs{constructor(){super("twitter.com")}static credential(e,t){return Pn._fromParams({providerId:$t.PROVIDER_ID,signInMethod:$t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return $t.credentialFromTaggedObject(e)}static credentialFromError(e){return $t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return $t.credential(t,r)}catch(s){return null}}}$t.TWITTER_SIGN_IN_METHOD="twitter.com";$t.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pg(n,e){return _(this,null,function*(){return ds(n,"POST","/v1/accounts:signUp",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static _fromIdTokenResponse(e,t,r,s=!1){return _(this,null,function*(){const i=yield tt._fromIdTokenResponse(e,r,s),a=ku(r);return new Sn({user:i,providerId:a,_tokenResponse:r,operationType:t})})}static _forOperation(e,t,r){return _(this,null,function*(){yield e._updateTokensIfNecessary(r,!0);const s=ku(r);return new Sn({user:e,providerId:s,_tokenResponse:r,operationType:t})})}}function ku(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li extends Vt{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,li.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!=null?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new li(e,t,r,s)}}function fh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?li._fromErrorAndOperation(n,i,e,r):i})}function Sg(n,e,t=!1){return _(this,null,function*(){const r=yield Wn(n,e._linkToIdToken(n.auth,yield n.getIdToken()),t);return Sn._forOperation(n,"link",r)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vg(n,e,t=!1){return _(this,null,function*(){const{auth:r}=n;if(Fe(r.app))return Promise.reject(ut(r));const s="reauthenticate";try{const i=yield Wn(n,fh(r,s,e,n),t);j(i.idToken,r,"internal-error");const a=pa(i.idToken);j(a,r,"internal-error");const{sub:c}=a;return j(n.uid===c,r,"user-mismatch"),Sn._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Ze(r,"user-mismatch"),i}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ph(n,e,t=!1){return _(this,null,function*(){if(Fe(n.app))return Promise.reject(ut(n));const r="signIn",s=yield fh(n,r,e),i=yield Sn._fromIdTokenResponse(n,r,s);return t||(yield n._updateCurrentUser(i.user)),i})}function Cg(n,e){return _(this,null,function*(){return ph(yt(n),e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mh(n){return _(this,null,function*(){const e=yt(n);e._getPasswordPolicyInternal()&&(yield e._updatePasswordPolicy())})}function FI(n,e,t){return _(this,null,function*(){if(Fe(n.app))return Promise.reject(ut(n));const r=yt(n),a=yield jo(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Pg).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&mh(n),l}),c=yield Sn._fromIdTokenResponse(r,"signIn",a);return yield r._updateCurrentUser(c.user),c})}function BI(n,e,t){return Fe(n.app)?Promise.reject(ut(n)):Cg(fe(n),rr.credential(e,t)).catch(r=>_(null,null,function*(){throw r.code==="auth/password-does-not-meet-requirements"&&mh(n),r}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bg(n,e){return _(this,null,function*(){return _t(n,"POST","/v1/accounts:createAuthUri",Ct(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $I(n,e){return _(this,null,function*(){const t=Ql()?ai():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:s}=yield bg(fe(n),r);return s||[]})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ng(n,e){return _(this,null,function*(){return _t(n,"POST","/v1/accounts:update",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qI(n,e){return _(this,null,function*(){const{displayName:t,photoURL:r}=e;if(t===void 0&&r===void 0)return;const s=fe(n),a={idToken:yield s.getIdToken(),displayName:t,photoUrl:r,returnSecureToken:!0},c=yield Wn(s,Ng(s.auth,a));s.displayName=c.displayName||null,s.photoURL=c.photoUrl||null;const l=s.providerData.find(({providerId:d})=>d==="password");l&&(l.displayName=s.displayName,l.photoURL=s.photoURL),yield s._updateTokensIfNecessary(c)})}function kg(n,e,t,r){return fe(n).onIdTokenChanged(e,t,r)}function Dg(n,e,t){return fe(n).beforeAuthStateChanged(e,t)}function jI(n,e,t,r){return fe(n).onAuthStateChanged(e,t,r)}function zI(n){return fe(n).signOut()}const hi="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gh{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(hi,"1"),this.storage.removeItem(hi),Promise.resolve(!0)):Promise.resolve(!1)}catch(e){return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xg=1e3,Og=10;class qn extends gh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ch(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);tg()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Og):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},xg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}_set(e,t){return _(this,null,function*(){yield gn(qn.prototype,this,"_set").call(this,e,t),this.localCache[e]=JSON.stringify(t)})}_get(e){return _(this,null,function*(){const t=yield gn(qn.prototype,this,"_get").call(this,e);return this.localCache[e]=JSON.stringify(t),t})}_remove(e){return _(this,null,function*(){yield gn(qn.prototype,this,"_remove").call(this,e),delete this.localCache[e]})}}qn.type="LOCAL";const Lg=qn;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h extends gh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}_h.type="SESSION";const yh=_h;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mg(n){return Promise.all(n.map(e=>_(null,null,function*(){try{return{fulfilled:!0,value:yield e}}catch(t){return{fulfilled:!1,reason:t}}})))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new ki(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}handleEvent(e){return _(this,null,function*(){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(d=>_(this,null,function*(){return d(t.origin,i)})),l=yield Mg(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ki.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ya(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ug{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}_send(e,t,r=50){return _(this,null,function*(){const s=typeof MessageChannel!="undefined"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,l)=>{const d=ya("",20);s.port1.start();const p=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const w=m;if(w.data.eventId===d)switch(w.data.status){case"ack":clearTimeout(p),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(w.data.response);break;default:clearTimeout(p),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lt(){return window}function Fg(n){lt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eh(){return typeof lt().WorkerGlobalScope!="undefined"&&typeof lt().importScripts=="function"}function Bg(){return _(this,null,function*(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(yield navigator.serviceWorker.ready).active}catch(n){return null}})}function $g(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function qg(){return Eh()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Th="firebaseLocalStorageDb",jg=1,di="firebaseLocalStorage",wh="fbase_key";class ps{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Di(n,e){return n.transaction([di],e?"readwrite":"readonly").objectStore(di)}function zg(){const n=indexedDB.deleteDatabase(Th);return new ps(n).toPromise()}function Ih(){const n=indexedDB.open(Th,jg);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(di,{keyPath:wh})}catch(s){t(s)}}),n.addEventListener("success",()=>_(null,null,function*(){const r=n.result;r.objectStoreNames.contains(di)?e(r):(r.close(),yield zg(),e(yield Ih()))}))})}function Du(n,e,t){return _(this,null,function*(){const r=Di(n,!0).put({[wh]:e,value:t});return new ps(r).toPromise()})}function Hg(n,e){return _(this,null,function*(){const t=Di(n,!1).get(e),r=yield new ps(t).toPromise();return r===void 0?null:r.value})}function xu(n,e){const t=Di(n,!0).delete(e);return new ps(t).toPromise()}const Wg=800,Gg=3;class vh{registerLifecycleListeners(){typeof window!="undefined"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window!="undefined"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}_openDb(){return _(this,null,function*(){return this.dbPromise?this.dbPromise:(this.dbPromise=Ih(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)})}_withRetries(e){return _(this,null,function*(){let t=0;for(;;)try{const r=yield this._openDb();return yield e(r)}catch(r){if(t++>Gg)throw r;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(yield s).close()}catch(i){}}}})}initializeServiceWorkerMessaging(){return _(this,null,function*(){return Eh()?this.initializeReceiver():this.initializeSender()})}initializeReceiver(){return _(this,null,function*(){this.receiver=ki._getInstance(qg()),this.receiver._subscribe("keyChanged",(e,t)=>_(this,null,function*(){return{keyProcessed:(yield this._poll()).includes(t.key)}})),this.receiver._subscribe("ping",(e,t)=>_(this,null,function*(){return["keyChanged"]}))})}initializeSender(){return _(this,null,function*(){var t,r;if(this.activeServiceWorker=yield Bg(),!this.activeServiceWorker)return;this.sender=new Ug(this.activeServiceWorker);const e=yield this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)})}notifyServiceWorker(e){return _(this,null,function*(){if(!(!this.sender||!this.activeServiceWorker||$g()!==this.activeServiceWorker))try{yield this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch(t){}})}_isAvailable(){return _(this,null,function*(){try{return indexedDB?(yield this._withRetries(e=>_(this,null,function*(){yield Du(e,hi,"1"),yield xu(e,hi)})),!0):!1}catch(e){}return!1})}_withPendingWrite(e){return _(this,null,function*(){this.pendingWrites++;try{yield e()}finally{this.pendingWrites--}})}_set(e,t){return _(this,null,function*(){return this._withPendingWrite(()=>_(this,null,function*(){return yield this._withRetries(r=>Du(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)}))})}_get(e){return _(this,null,function*(){const t=yield this._withRetries(r=>Hg(r,e));return this.localCache[e]=t,t})}_remove(e){return _(this,null,function*(){return this._withPendingWrite(()=>_(this,null,function*(){return yield this._withRetries(t=>xu(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)}))})}_poll(){return _(this,null,function*(){if(this.isClosing)return[];try{const e=yield this._withRetries(s=>{const i=Di(s,!1).getAll();return new ps(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||Ks(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}})}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>_(this,null,function*(){return this._poll()}),Wg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}vh.type="LOCAL";const Kg=vh;new hs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ea(n,e){return e?wt(e):(j(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ta extends ga{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return $n(e,this._buildIdpRequest())}_linkToIdToken(e,t){return $n(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return $n(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Qg(n){return ph(n.auth,new Ta(n),n.bypassAuthState)}function Yg(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Vg(t,new Ta(n),n.bypassAuthState)}function Jg(n){return _(this,null,function*(){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Sg(t,new Ta(n),n.bypassAuthState)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ah{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise((e,t)=>_(this,null,function*(){this.pendingPromise={resolve:e,reject:t};try{this.eventManager=yield this.resolver._initialize(this.auth),yield this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}}))}onAuthEvent(e){return _(this,null,function*(){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(yield this.getIdpTask(c)(l))}catch(d){this.reject(d)}})}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Qg;case"linkViaPopup":case"linkViaRedirect":return Jg;case"reauthViaPopup":case"reauthViaRedirect":return Yg;default:Ze(this.auth,"internal-error")}}resolve(e){Rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xg=new hs(2e3,1e4);function HI(n,e,t){return _(this,null,function*(){if(Fe(n.app))return Promise.reject(nt(n,"operation-not-supported-in-this-environment"));const r=yt(n);Kl(n,e,Ni);const s=Ea(r,t);return new En(r,"signInViaPopup",e,s).executeNotNull()})}class En extends Ah{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,En.currentPopupAction&&En.currentPopupAction.cancel(),En.currentPopupAction=this}executeNotNull(){return _(this,null,function*(){const e=yield this.execute();return j(e,this.auth,"internal-error"),e})}onExecution(){return _(this,null,function*(){Rt(this.filter.length===1,"Popup operations only handle one event");const e=ya();this.authWindow=yield this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(nt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()})}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(nt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,En.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(nt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Xg.get())};e()}}En.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zg="pendingRedirect",Js=new Map;class Mr extends Ah{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}execute(){return _(this,null,function*(){let e=Js.get(this.auth._key());if(!e){try{const r=(yield e_(this.resolver,this.auth))?yield gn(Mr.prototype,this,"execute").call(this):null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Js.set(this.auth._key(),e)}return this.bypassAuthState||Js.set(this.auth._key(),()=>Promise.resolve(null)),e()})}onAuthEvent(e){return _(this,null,function*(){if(e.type==="signInViaRedirect")return gn(Mr.prototype,this,"onAuthEvent").call(this,e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=yield this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,gn(Mr.prototype,this,"onAuthEvent").call(this,e);this.resolve(null)}})}onExecution(){return _(this,null,function*(){})}cleanUp(){}}function e_(n,e){return _(this,null,function*(){const t=Ph(e),r=Rh(n);if(!(yield r._isAvailable()))return!1;const s=(yield r._get(t))==="true";return yield r._remove(t),s})}function t_(n,e){return _(this,null,function*(){return Rh(n)._set(Ph(e),"true")})}function n_(n,e){Js.set(n._key(),e)}function Rh(n){return wt(n._redirectPersistence)}function Ph(n){return Ys(Zg,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WI(n,e,t){return r_(n,e,t)}function r_(n,e,t){return _(this,null,function*(){if(Fe(n.app))return Promise.reject(ut(n));const r=yt(n);Kl(n,e,Ni),yield r._initializationPromise;const s=Ea(r,t);return yield t_(s,r),s._openRedirect(r,e,"signInViaRedirect")})}function GI(n,e){return _(this,null,function*(){return yield yt(n)._initializationPromise,Sh(n,e,!1)})}function Sh(n,e,t=!1){return _(this,null,function*(){if(Fe(n.app))return Promise.reject(ut(n));const r=yt(n),s=Ea(r,e),a=yield new Mr(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,yield r._persistUserIfCurrent(a.user),yield r._setRedirectUser(null,e)),a})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s_=600*1e3;class i_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!o_(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Vh(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(nt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=s_&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ou(e))}saveEventToCache(e){this.cachedEventUids.add(Ou(e)),this.lastProcessedEventTime=Date.now()}}function Ou(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Vh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function o_(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Vh(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function a_(t){return _(this,arguments,function*(n,e={}){return _t(n,"GET","/v1/projects",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,u_=/^https?/;function l_(n){return _(this,null,function*(){if(n.config.emulator)return;const{authorizedDomains:e}=yield a_(n);for(const t of e)try{if(h_(t))return}catch(r){}Ze(n,"unauthorized-domain")})}function h_(n){const e=ai(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!u_.test(t))return!1;if(c_.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_=new hs(3e4,6e4);function Lu(){const n=lt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function f_(n){return new Promise((e,t)=>{var s,i,a;function r(){Lu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Lu(),t(nt(n,"network-request-failed"))},timeout:d_.get()})}if((i=(s=lt().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((a=lt().gapi)!=null&&a.load)r();else{const c=lg("iframefcb");return lt()[c]=()=>{gapi.load?r():t(nt(n,"network-request-failed"))},lh(`${ug()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw Xs=null,e})}let Xs=null;function p_(n){return Xs=Xs||f_(n),Xs}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m_=new hs(5e3,15e3),g_="__/auth/iframe",__="emulator/auth/iframe",y_={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},E_=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function T_(n){const e=n.config;j(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?fa(e,__):`https://${n.config.authDomain}/${g_}`,r={apiKey:e.apiKey,appName:n.name,v:nr},s=E_.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${ls(r).slice(1)}`}function w_(n){return _(this,null,function*(){const e=yield p_(n),t=lt().gapi;return j(t,n,"internal-error"),e.open({where:document.body,url:T_(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:y_,dontclear:!0},r=>new Promise((s,i)=>_(null,null,function*(){yield r.restyle({setHideOnLeave:!1});const a=nt(n,"network-request-failed"),c=lt().setTimeout(()=>{i(a)},m_.get());function l(){lt().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(a)})})))})}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I_={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},v_=500,A_=600,R_="_blank",P_="http://localhost";class Mu{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(e){}}}function S_(n,e,t,r=v_,s=A_){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l=ue(G({},I_),{width:r.toString(),height:s.toString(),top:i,left:a}),d=be().toLowerCase();t&&(c=rh(d)?R_:t),th(d)&&(e=e||P_,l.scrollbars="yes");const p=Object.entries(l).reduce((w,[V,k])=>`${w}${V}=${k},`,"");if(eg(d)&&c!=="_self")return V_(e||"",c),new Mu(null);const m=window.open(e||"",c,p);j(m,n,"popup-blocked");try{m.focus()}catch(w){}return new Mu(m)}function V_(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C_="__/auth/handler",b_="emulator/auth/handler",N_=encodeURIComponent("fac");function Uu(n,e,t,r,s,i){return _(this,null,function*(){j(n.config.authDomain,n,"auth-domain-config-required"),j(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:nr,eventId:s};if(e instanceof Ni){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",xp(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,m]of Object.entries({}))a[p]=m}if(e instanceof fs){const p=e.getScopes().filter(m=>m!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const p of Object.keys(c))c[p]===void 0&&delete c[p];const l=yield n._getAppCheckToken(),d=l?`#${N_}=${encodeURIComponent(l)}`:"";return`${k_(n)}?${ls(c).slice(1)}${d}`})}function k_({config:n}){return n.emulator?fa(n,b_):`https://${n.authDomain}/${C_}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const No="webStorageSupport";class D_{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=yh,this._completeRedirectFn=Sh,this._overrideRedirectResult=n_}_openPopup(e,t,r,s){return _(this,null,function*(){var a;Rt((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const i=yield Uu(e,t,r,ai(),s);return S_(e,i,ya())})}_openRedirect(e,t,r,s){return _(this,null,function*(){yield this._originValidation(e);const i=yield Uu(e,t,r,ai(),s);return Fg(i),new Promise(()=>{})})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Rt(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}initAndGetManager(e){return _(this,null,function*(){const t=yield w_(e),r=new i_(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r})}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(No,{type:No},s=>{var a;const i=(a=s==null?void 0:s[0])==null?void 0:a[No];i!==void 0&&t(!!i),Ze(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=l_(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return ch()||nh()||ma()}}const x_=D_;var Fu="@firebase/auth",Bu="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}getToken(e){return _(this,null,function*(){return this.assertAuthConfigured(),yield this.auth._initializationPromise,this.auth.currentUser?{accessToken:yield this.auth.currentUser.getIdToken(e)}:null})}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L_(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function M_(n){Hn(new Rn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;j(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:uh(n)},d=new og(r,s,i,l);return mg(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Hn(new Rn("auth-internal",e=>{const t=yt(e.getProvider("auth").getImmediate());return(r=>new O_(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),jt(Fu,Bu,L_(n)),jt(Fu,Bu,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_=300,F_=$l("authIdTokenMaxAge")||U_;let $u=null;const B_=n=>e=>_(null,null,function*(){const t=e&&(yield e.getIdTokenResult()),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>F_)return;const s=t==null?void 0:t.token;$u!==s&&($u=s,yield fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))});function KI(n=jl()){const e=Vi(n,"auth");if(e.isInitialized())return e.getImmediate();const t=pg(n,{popupRedirectResolver:x_,persistence:[Kg,Lg,yh]}),r=$l("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=B_(i.toString());Dg(t,a,()=>a(t.currentUser)),kg(t,c=>a(c))}}const s=Fl("auth");return s&&gg(t,`http://${s}`),t}function $_(){var n,e;return(e=(n=document.getElementsByTagName("head"))==null?void 0:n[0])!=null?e:document}ag({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=nt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",$_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});M_("Browser");var qu=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var zt,Ch;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,g){function E(){}E.prototype=g.prototype,v.F=g.prototype,v.prototype=new E,v.prototype.constructor=v,v.D=function(A,I,P){for(var y=Array(arguments.length-2),Le=2;Le<arguments.length;Le++)y[Le-2]=arguments[Le];return g.prototype[I].apply(A,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,g,E){E||(E=0);const A=Array(16);if(typeof g=="string")for(var I=0;I<16;++I)A[I]=g.charCodeAt(E++)|g.charCodeAt(E++)<<8|g.charCodeAt(E++)<<16|g.charCodeAt(E++)<<24;else for(I=0;I<16;++I)A[I]=g[E++]|g[E++]<<8|g[E++]<<16|g[E++]<<24;g=v.g[0],E=v.g[1],I=v.g[2];let P=v.g[3],y;y=g+(P^E&(I^P))+A[0]+3614090360&4294967295,g=E+(y<<7&4294967295|y>>>25),y=P+(I^g&(E^I))+A[1]+3905402710&4294967295,P=g+(y<<12&4294967295|y>>>20),y=I+(E^P&(g^E))+A[2]+606105819&4294967295,I=P+(y<<17&4294967295|y>>>15),y=E+(g^I&(P^g))+A[3]+3250441966&4294967295,E=I+(y<<22&4294967295|y>>>10),y=g+(P^E&(I^P))+A[4]+4118548399&4294967295,g=E+(y<<7&4294967295|y>>>25),y=P+(I^g&(E^I))+A[5]+1200080426&4294967295,P=g+(y<<12&4294967295|y>>>20),y=I+(E^P&(g^E))+A[6]+2821735955&4294967295,I=P+(y<<17&4294967295|y>>>15),y=E+(g^I&(P^g))+A[7]+4249261313&4294967295,E=I+(y<<22&4294967295|y>>>10),y=g+(P^E&(I^P))+A[8]+1770035416&4294967295,g=E+(y<<7&4294967295|y>>>25),y=P+(I^g&(E^I))+A[9]+2336552879&4294967295,P=g+(y<<12&4294967295|y>>>20),y=I+(E^P&(g^E))+A[10]+4294925233&4294967295,I=P+(y<<17&4294967295|y>>>15),y=E+(g^I&(P^g))+A[11]+2304563134&4294967295,E=I+(y<<22&4294967295|y>>>10),y=g+(P^E&(I^P))+A[12]+1804603682&4294967295,g=E+(y<<7&4294967295|y>>>25),y=P+(I^g&(E^I))+A[13]+4254626195&4294967295,P=g+(y<<12&4294967295|y>>>20),y=I+(E^P&(g^E))+A[14]+2792965006&4294967295,I=P+(y<<17&4294967295|y>>>15),y=E+(g^I&(P^g))+A[15]+1236535329&4294967295,E=I+(y<<22&4294967295|y>>>10),y=g+(I^P&(E^I))+A[1]+4129170786&4294967295,g=E+(y<<5&4294967295|y>>>27),y=P+(E^I&(g^E))+A[6]+3225465664&4294967295,P=g+(y<<9&4294967295|y>>>23),y=I+(g^E&(P^g))+A[11]+643717713&4294967295,I=P+(y<<14&4294967295|y>>>18),y=E+(P^g&(I^P))+A[0]+3921069994&4294967295,E=I+(y<<20&4294967295|y>>>12),y=g+(I^P&(E^I))+A[5]+3593408605&4294967295,g=E+(y<<5&4294967295|y>>>27),y=P+(E^I&(g^E))+A[10]+38016083&4294967295,P=g+(y<<9&4294967295|y>>>23),y=I+(g^E&(P^g))+A[15]+3634488961&4294967295,I=P+(y<<14&4294967295|y>>>18),y=E+(P^g&(I^P))+A[4]+3889429448&4294967295,E=I+(y<<20&4294967295|y>>>12),y=g+(I^P&(E^I))+A[9]+568446438&4294967295,g=E+(y<<5&4294967295|y>>>27),y=P+(E^I&(g^E))+A[14]+3275163606&4294967295,P=g+(y<<9&4294967295|y>>>23),y=I+(g^E&(P^g))+A[3]+4107603335&4294967295,I=P+(y<<14&4294967295|y>>>18),y=E+(P^g&(I^P))+A[8]+1163531501&4294967295,E=I+(y<<20&4294967295|y>>>12),y=g+(I^P&(E^I))+A[13]+2850285829&4294967295,g=E+(y<<5&4294967295|y>>>27),y=P+(E^I&(g^E))+A[2]+4243563512&4294967295,P=g+(y<<9&4294967295|y>>>23),y=I+(g^E&(P^g))+A[7]+1735328473&4294967295,I=P+(y<<14&4294967295|y>>>18),y=E+(P^g&(I^P))+A[12]+2368359562&4294967295,E=I+(y<<20&4294967295|y>>>12),y=g+(E^I^P)+A[5]+4294588738&4294967295,g=E+(y<<4&4294967295|y>>>28),y=P+(g^E^I)+A[8]+2272392833&4294967295,P=g+(y<<11&4294967295|y>>>21),y=I+(P^g^E)+A[11]+1839030562&4294967295,I=P+(y<<16&4294967295|y>>>16),y=E+(I^P^g)+A[14]+4259657740&4294967295,E=I+(y<<23&4294967295|y>>>9),y=g+(E^I^P)+A[1]+2763975236&4294967295,g=E+(y<<4&4294967295|y>>>28),y=P+(g^E^I)+A[4]+1272893353&4294967295,P=g+(y<<11&4294967295|y>>>21),y=I+(P^g^E)+A[7]+4139469664&4294967295,I=P+(y<<16&4294967295|y>>>16),y=E+(I^P^g)+A[10]+3200236656&4294967295,E=I+(y<<23&4294967295|y>>>9),y=g+(E^I^P)+A[13]+681279174&4294967295,g=E+(y<<4&4294967295|y>>>28),y=P+(g^E^I)+A[0]+3936430074&4294967295,P=g+(y<<11&4294967295|y>>>21),y=I+(P^g^E)+A[3]+3572445317&4294967295,I=P+(y<<16&4294967295|y>>>16),y=E+(I^P^g)+A[6]+76029189&4294967295,E=I+(y<<23&4294967295|y>>>9),y=g+(E^I^P)+A[9]+3654602809&4294967295,g=E+(y<<4&4294967295|y>>>28),y=P+(g^E^I)+A[12]+3873151461&4294967295,P=g+(y<<11&4294967295|y>>>21),y=I+(P^g^E)+A[15]+530742520&4294967295,I=P+(y<<16&4294967295|y>>>16),y=E+(I^P^g)+A[2]+3299628645&4294967295,E=I+(y<<23&4294967295|y>>>9),y=g+(I^(E|~P))+A[0]+4096336452&4294967295,g=E+(y<<6&4294967295|y>>>26),y=P+(E^(g|~I))+A[7]+1126891415&4294967295,P=g+(y<<10&4294967295|y>>>22),y=I+(g^(P|~E))+A[14]+2878612391&4294967295,I=P+(y<<15&4294967295|y>>>17),y=E+(P^(I|~g))+A[5]+4237533241&4294967295,E=I+(y<<21&4294967295|y>>>11),y=g+(I^(E|~P))+A[12]+1700485571&4294967295,g=E+(y<<6&4294967295|y>>>26),y=P+(E^(g|~I))+A[3]+2399980690&4294967295,P=g+(y<<10&4294967295|y>>>22),y=I+(g^(P|~E))+A[10]+4293915773&4294967295,I=P+(y<<15&4294967295|y>>>17),y=E+(P^(I|~g))+A[1]+2240044497&4294967295,E=I+(y<<21&4294967295|y>>>11),y=g+(I^(E|~P))+A[8]+1873313359&4294967295,g=E+(y<<6&4294967295|y>>>26),y=P+(E^(g|~I))+A[15]+4264355552&4294967295,P=g+(y<<10&4294967295|y>>>22),y=I+(g^(P|~E))+A[6]+2734768916&4294967295,I=P+(y<<15&4294967295|y>>>17),y=E+(P^(I|~g))+A[13]+1309151649&4294967295,E=I+(y<<21&4294967295|y>>>11),y=g+(I^(E|~P))+A[4]+4149444226&4294967295,g=E+(y<<6&4294967295|y>>>26),y=P+(E^(g|~I))+A[11]+3174756917&4294967295,P=g+(y<<10&4294967295|y>>>22),y=I+(g^(P|~E))+A[2]+718787259&4294967295,I=P+(y<<15&4294967295|y>>>17),y=E+(P^(I|~g))+A[9]+3951481745&4294967295,v.g[0]=v.g[0]+g&4294967295,v.g[1]=v.g[1]+(I+(y<<21&4294967295|y>>>11))&4294967295,v.g[2]=v.g[2]+I&4294967295,v.g[3]=v.g[3]+P&4294967295}r.prototype.v=function(v,g){g===void 0&&(g=v.length);const E=g-this.blockSize,A=this.C;let I=this.h,P=0;for(;P<g;){if(I==0)for(;P<=E;)s(this,v,P),P+=this.blockSize;if(typeof v=="string"){for(;P<g;)if(A[I++]=v.charCodeAt(P++),I==this.blockSize){s(this,A),I=0;break}}else for(;P<g;)if(A[I++]=v[P++],I==this.blockSize){s(this,A),I=0;break}}this.h=I,this.o+=g},r.prototype.A=function(){var v=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);v[0]=128;for(var g=1;g<v.length-8;++g)v[g]=0;g=this.o*8;for(var E=v.length-8;E<v.length;++E)v[E]=g&255,g/=256;for(this.v(v),v=Array(16),g=0,E=0;E<4;++E)for(let A=0;A<32;A+=8)v[g++]=this.g[E]>>>A&255;return v};function i(v,g){var E=c;return Object.prototype.hasOwnProperty.call(E,v)?E[v]:E[v]=g(v)}function a(v,g){this.h=g;const E=[];let A=!0;for(let I=v.length-1;I>=0;I--){const P=v[I]|0;A&&P==g||(E[I]=P,A=!1)}this.g=E}var c={};function l(v){return-128<=v&&v<128?i(v,function(g){return new a([g|0],g<0?-1:0)}):new a([v|0],v<0?-1:0)}function d(v){if(isNaN(v)||!isFinite(v))return m;if(v<0)return M(d(-v));const g=[];let E=1;for(let A=0;v>=E;A++)g[A]=v/E|0,E*=4294967296;return new a(g,0)}function p(v,g){if(v.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(v.charAt(0)=="-")return M(p(v.substring(1),g));if(v.indexOf("-")>=0)throw Error('number format error: interior "-" character');const E=d(Math.pow(g,8));let A=m;for(let P=0;P<v.length;P+=8){var I=Math.min(8,v.length-P);const y=parseInt(v.substring(P,P+I),g);I<8?(I=d(Math.pow(g,I)),A=A.j(I).add(d(y))):(A=A.j(E),A=A.add(d(y)))}return A}var m=l(0),w=l(1),V=l(16777216);n=a.prototype,n.m=function(){if(U(this))return-M(this).m();let v=0,g=1;for(let E=0;E<this.g.length;E++){const A=this.i(E);v+=(A>=0?A:4294967296+A)*g,g*=4294967296}return v},n.toString=function(v){if(v=v||10,v<2||36<v)throw Error("radix out of range: "+v);if(k(this))return"0";if(U(this))return"-"+M(this).toString(v);const g=d(Math.pow(v,6));var E=this;let A="";for(;;){const I=ke(E,g).g;E=K(E,I.j(g));let P=((E.g.length>0?E.g[0]:E.h)>>>0).toString(v);if(E=I,k(E))return P+A;for(;P.length<6;)P="0"+P;A=P+A}},n.i=function(v){return v<0?0:v<this.g.length?this.g[v]:this.h};function k(v){if(v.h!=0)return!1;for(let g=0;g<v.g.length;g++)if(v.g[g]!=0)return!1;return!0}function U(v){return v.h==-1}n.l=function(v){return v=K(this,v),U(v)?-1:k(v)?0:1};function M(v){const g=v.g.length,E=[];for(let A=0;A<g;A++)E[A]=~v.g[A];return new a(E,~v.h).add(w)}n.abs=function(){return U(this)?M(this):this},n.add=function(v){const g=Math.max(this.g.length,v.g.length),E=[];let A=0;for(let I=0;I<=g;I++){let P=A+(this.i(I)&65535)+(v.i(I)&65535),y=(P>>>16)+(this.i(I)>>>16)+(v.i(I)>>>16);A=y>>>16,P&=65535,y&=65535,E[I]=y<<16|P}return new a(E,E[E.length-1]&-2147483648?-1:0)};function K(v,g){return v.add(M(g))}n.j=function(v){if(k(this)||k(v))return m;if(U(this))return U(v)?M(this).j(M(v)):M(M(this).j(v));if(U(v))return M(this.j(M(v)));if(this.l(V)<0&&v.l(V)<0)return d(this.m()*v.m());const g=this.g.length+v.g.length,E=[];for(var A=0;A<2*g;A++)E[A]=0;for(A=0;A<this.g.length;A++)for(let I=0;I<v.g.length;I++){const P=this.i(A)>>>16,y=this.i(A)&65535,Le=v.i(I)>>>16,ln=v.i(I)&65535;E[2*A+2*I]+=y*ln,Z(E,2*A+2*I),E[2*A+2*I+1]+=P*ln,Z(E,2*A+2*I+1),E[2*A+2*I+1]+=y*Le,Z(E,2*A+2*I+1),E[2*A+2*I+2]+=P*Le,Z(E,2*A+2*I+2)}for(v=0;v<g;v++)E[v]=E[2*v+1]<<16|E[2*v];for(v=g;v<2*g;v++)E[v]=0;return new a(E,0)};function Z(v,g){for(;(v[g]&65535)!=v[g];)v[g+1]+=v[g]>>>16,v[g]&=65535,g++}function re(v,g){this.g=v,this.h=g}function ke(v,g){if(k(g))throw Error("division by zero");if(k(v))return new re(m,m);if(U(v))return g=ke(M(v),g),new re(M(g.g),M(g.h));if(U(g))return g=ke(v,M(g)),new re(M(g.g),g.h);if(v.g.length>30){if(U(v)||U(g))throw Error("slowDivide_ only works with positive integers.");for(var E=w,A=g;A.l(v)<=0;)E=ge(E),A=ge(A);var I=_e(E,1),P=_e(A,1);for(A=_e(A,2),E=_e(E,2);!k(A);){var y=P.add(A);y.l(v)<=0&&(I=I.add(E),P=y),A=_e(A,1),E=_e(E,1)}return g=K(v,I.j(g)),new re(I,g)}for(I=m;v.l(g)>=0;){for(E=Math.max(1,Math.floor(v.m()/g.m())),A=Math.ceil(Math.log(E)/Math.LN2),A=A<=48?1:Math.pow(2,A-48),P=d(E),y=P.j(g);U(y)||y.l(v)>0;)E-=A,P=d(E),y=P.j(g);k(P)&&(P=w),I=I.add(P),v=K(v,y)}return new re(I,v)}n.B=function(v){return ke(this,v).h},n.and=function(v){const g=Math.max(this.g.length,v.g.length),E=[];for(let A=0;A<g;A++)E[A]=this.i(A)&v.i(A);return new a(E,this.h&v.h)},n.or=function(v){const g=Math.max(this.g.length,v.g.length),E=[];for(let A=0;A<g;A++)E[A]=this.i(A)|v.i(A);return new a(E,this.h|v.h)},n.xor=function(v){const g=Math.max(this.g.length,v.g.length),E=[];for(let A=0;A<g;A++)E[A]=this.i(A)^v.i(A);return new a(E,this.h^v.h)};function ge(v){const g=v.g.length+1,E=[];for(let A=0;A<g;A++)E[A]=v.i(A)<<1|v.i(A-1)>>>31;return new a(E,v.h)}function _e(v,g){const E=g>>5;g%=32;const A=v.g.length-E,I=[];for(let P=0;P<A;P++)I[P]=g>0?v.i(P+E)>>>g|v.i(P+E+1)<<32-g:v.i(P+E);return new a(I,v.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Ch=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,zt=a}).apply(typeof qu!="undefined"?qu:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var qs=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bh,kr,Nh,Zs,zo,kh,Dh,xh;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof qs=="object"&&qs];for(var u=0;u<o.length;++u){var h=o[u];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var h=r;o=o.split(".");for(var f=0;f<o.length-1;f++){var R=o[f];if(!(R in h))break e;h=h[R]}o=o[o.length-1],f=h[o],u=u(f),u!=f&&u!=null&&e(h,o,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(o){return o||function(u){var h=[],f;for(f in u)Object.prototype.hasOwnProperty.call(u,f)&&h.push([f,u[f]]);return h}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},a=this||self;function c(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function l(o,u,h){return o.call.apply(o.bind,arguments)}function d(o,u,h){return d=l,d.apply(null,arguments)}function p(o,u){var h=Array.prototype.slice.call(arguments,1);return function(){var f=h.slice();return f.push.apply(f,arguments),o.apply(this,f)}}function m(o,u){function h(){}h.prototype=u.prototype,o.Z=u.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(f,R,S){for(var x=Array(arguments.length-2),W=2;W<arguments.length;W++)x[W-2]=arguments[W];return u.prototype[R].apply(f,x)}}var w=typeof AsyncContext!="undefined"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function V(o){const u=o.length;if(u>0){const h=Array(u);for(let f=0;f<u;f++)h[f]=o[f];return h}return[]}function k(o,u){for(let f=1;f<arguments.length;f++){const R=arguments[f];var h=typeof R;if(h=h!="object"?h:R?Array.isArray(R)?"array":h:"null",h=="array"||h=="object"&&typeof R.length=="number"){h=o.length||0;const S=R.length||0;o.length=h+S;for(let x=0;x<S;x++)o[h+x]=R[x]}else o.push(R)}}class U{constructor(u,h){this.i=u,this.j=h,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function M(o){a.setTimeout(()=>{throw o},0)}function K(){var o=v;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class Z{constructor(){this.h=this.g=null}add(u,h){const f=re.get();f.set(u,h),this.h?this.h.next=f:this.g=f,this.h=f}}var re=new U(()=>new ke,o=>o.reset());class ke{constructor(){this.next=this.g=this.h=null}set(u,h){this.h=u,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ge,_e=!1,v=new Z,g=()=>{const o=Promise.resolve(void 0);ge=()=>{o.then(E)}};function E(){for(var o;o=K();){try{o.h.call(o.g)}catch(h){M(h)}var u=re;u.j(o),u.h<100&&(u.h++,o.next=u.g,u.g=o)}_e=!1}function A(){this.u=this.u,this.C=this.C}A.prototype.u=!1,A.prototype.dispose=function(){this.u||(this.u=!0,this.N())},A.prototype[Symbol.dispose]=function(){this.dispose()},A.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function I(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}I.prototype.h=function(){this.defaultPrevented=!0};var P=(function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};a.addEventListener("test",h,u),a.removeEventListener("test",h,u)}catch(h){}return o})();function y(o){return/^[\s\xa0]*$/.test(o)}function Le(o,u){I.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,u)}m(Le,I),Le.prototype.init=function(o,u){const h=this.type=o.type,f=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget,u||(h=="mouseover"?u=o.fromElement:h=="mouseout"&&(u=o.toElement)),this.relatedTarget=u,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Le.Z.h.call(this)},Le.prototype.h=function(){Le.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ln="closure_listenable_"+(Math.random()*1e6|0),Cf=0;function bf(o,u,h,f,R){this.listener=o,this.proxy=null,this.src=u,this.type=h,this.capture=!!f,this.ha=R,this.key=++Cf,this.da=this.fa=!1}function Rs(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Ps(o,u,h){for(const f in o)u.call(h,o[f],f,o)}function Nf(o,u){for(const h in o)u.call(void 0,o[h],h,o)}function hc(o){const u={};for(const h in o)u[h]=o[h];return u}const dc="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function fc(o,u){let h,f;for(let R=1;R<arguments.length;R++){f=arguments[R];for(h in f)o[h]=f[h];for(let S=0;S<dc.length;S++)h=dc[S],Object.prototype.hasOwnProperty.call(f,h)&&(o[h]=f[h])}}function Ss(o){this.src=o,this.g={},this.h=0}Ss.prototype.add=function(o,u,h,f,R){const S=o.toString();o=this.g[S],o||(o=this.g[S]=[],this.h++);const x=so(o,u,f,R);return x>-1?(u=o[x],h||(u.fa=!1)):(u=new bf(u,this.src,S,!!f,R),u.fa=h,o.push(u)),u};function ro(o,u){const h=u.type;if(h in o.g){var f=o.g[h],R=Array.prototype.indexOf.call(f,u,void 0),S;(S=R>=0)&&Array.prototype.splice.call(f,R,1),S&&(Rs(u),o.g[h].length==0&&(delete o.g[h],o.h--))}}function so(o,u,h,f){for(let R=0;R<o.length;++R){const S=o[R];if(!S.da&&S.listener==u&&S.capture==!!h&&S.ha==f)return R}return-1}var io="closure_lm_"+(Math.random()*1e6|0),oo={};function pc(o,u,h,f,R){if(Array.isArray(u)){for(let S=0;S<u.length;S++)pc(o,u[S],h,f,R);return null}return h=_c(h),o&&o[ln]?o.J(u,h,c(f)?!!f.capture:!1,R):kf(o,u,h,!1,f,R)}function kf(o,u,h,f,R,S){if(!u)throw Error("Invalid event type");const x=c(R)?!!R.capture:!!R;let W=co(o);if(W||(o[io]=W=new Ss(o)),h=W.add(u,h,f,x,S),h.proxy)return h;if(f=Df(),h.proxy=f,f.src=o,f.listener=h,o.addEventListener)P||(R=x),R===void 0&&(R=!1),o.addEventListener(u.toString(),f,R);else if(o.attachEvent)o.attachEvent(gc(u.toString()),f);else if(o.addListener&&o.removeListener)o.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return h}function Df(){function o(h){return u.call(o.src,o.listener,h)}const u=xf;return o}function mc(o,u,h,f,R){if(Array.isArray(u))for(var S=0;S<u.length;S++)mc(o,u[S],h,f,R);else f=c(f)?!!f.capture:!!f,h=_c(h),o&&o[ln]?(o=o.i,S=String(u).toString(),S in o.g&&(u=o.g[S],h=so(u,h,f,R),h>-1&&(Rs(u[h]),Array.prototype.splice.call(u,h,1),u.length==0&&(delete o.g[S],o.h--)))):o&&(o=co(o))&&(u=o.g[u.toString()],o=-1,u&&(o=so(u,h,f,R)),(h=o>-1?u[o]:null)&&ao(h))}function ao(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[ln])ro(u.i,o);else{var h=o.type,f=o.proxy;u.removeEventListener?u.removeEventListener(h,f,o.capture):u.detachEvent?u.detachEvent(gc(h),f):u.addListener&&u.removeListener&&u.removeListener(f),(h=co(u))?(ro(h,o),h.h==0&&(h.src=null,u[io]=null)):Rs(o)}}}function gc(o){return o in oo?oo[o]:oo[o]="on"+o}function xf(o,u){if(o.da)o=!0;else{u=new Le(u,this);const h=o.listener,f=o.ha||o.src;o.fa&&ao(o),o=h.call(f,u)}return o}function co(o){return o=o[io],o instanceof Ss?o:null}var uo="__closure_events_fn_"+(Math.random()*1e9>>>0);function _c(o){return typeof o=="function"?o:(o[uo]||(o[uo]=function(u){return o.handleEvent(u)}),o[uo])}function Pe(){A.call(this),this.i=new Ss(this),this.M=this,this.G=null}m(Pe,A),Pe.prototype[ln]=!0,Pe.prototype.removeEventListener=function(o,u,h,f){mc(this,o,u,h,f)};function De(o,u){var h,f=o.G;if(f)for(h=[];f;f=f.G)h.push(f);if(o=o.M,f=u.type||u,typeof u=="string")u=new I(u,o);else if(u instanceof I)u.target=u.target||o;else{var R=u;u=new I(f,o),fc(u,R)}R=!0;let S,x;if(h)for(x=h.length-1;x>=0;x--)S=u.g=h[x],R=Vs(S,f,!0,u)&&R;if(S=u.g=o,R=Vs(S,f,!0,u)&&R,R=Vs(S,f,!1,u)&&R,h)for(x=0;x<h.length;x++)S=u.g=h[x],R=Vs(S,f,!1,u)&&R}Pe.prototype.N=function(){if(Pe.Z.N.call(this),this.i){var o=this.i;for(const u in o.g){const h=o.g[u];for(let f=0;f<h.length;f++)Rs(h[f]);delete o.g[u],o.h--}}this.G=null},Pe.prototype.J=function(o,u,h,f){return this.i.add(String(o),u,!1,h,f)},Pe.prototype.K=function(o,u,h,f){return this.i.add(String(o),u,!0,h,f)};function Vs(o,u,h,f){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();let R=!0;for(let S=0;S<u.length;++S){const x=u[S];if(x&&!x.da&&x.capture==h){const W=x.listener,ye=x.ha||x.src;x.fa&&ro(o.i,x),R=W.call(ye,f)!==!1&&R}}return R&&!f.defaultPrevented}function Of(o,u){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=d(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:a.setTimeout(o,u||0)}function yc(o){o.g=Of(()=>{o.g=null,o.i&&(o.i=!1,yc(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class Lf extends A{constructor(u,h){super(),this.m=u,this.l=h,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:yc(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function hr(o){A.call(this),this.h=o,this.g={}}m(hr,A);var Ec=[];function Tc(o){Ps(o.g,function(u,h){this.g.hasOwnProperty(h)&&ao(u)},o),o.g={}}hr.prototype.N=function(){hr.Z.N.call(this),Tc(this)},hr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var lo=a.JSON.stringify,Mf=a.JSON.parse,Uf=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function wc(){}function Ic(){}var dr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ho(){I.call(this,"d")}m(ho,I);function fo(){I.call(this,"c")}m(fo,I);var hn={},vc=null;function Cs(){return vc=vc||new Pe}hn.Ia="serverreachability";function Ac(o){I.call(this,hn.Ia,o)}m(Ac,I);function fr(o){const u=Cs();De(u,new Ac(u))}hn.STAT_EVENT="statevent";function Rc(o,u){I.call(this,hn.STAT_EVENT,o),this.stat=u}m(Rc,I);function xe(o){const u=Cs();De(u,new Rc(u,o))}hn.Ja="timingevent";function Pc(o,u){I.call(this,hn.Ja,o),this.size=u}m(Pc,I);function pr(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},u)}function mr(){this.g=!0}mr.prototype.ua=function(){this.g=!1};function Ff(o,u,h,f,R,S){o.info(function(){if(o.g)if(S){var x="",W=S.split("&");for(let ne=0;ne<W.length;ne++){var ye=W[ne].split("=");if(ye.length>1){const we=ye[0];ye=ye[1];const ot=we.split("_");x=ot.length>=2&&ot[1]=="type"?x+(we+"="+ye+"&"):x+(we+"=redacted&")}}}else x=null;else x=S;return"XMLHTTP REQ ("+f+") [attempt "+R+"]: "+u+`
`+h+`
`+x})}function Bf(o,u,h,f,R,S,x){o.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+R+"]: "+u+`
`+h+`
`+S+" "+x})}function kn(o,u,h,f){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+qf(o,h)+(f?" "+f:"")})}function $f(o,u){o.info(function(){return"TIMEOUT: "+u})}mr.prototype.info=function(){};function qf(o,u){if(!o.g)return u;if(!u)return null;try{const S=JSON.parse(u);if(S){for(o=0;o<S.length;o++)if(Array.isArray(S[o])){var h=S[o];if(!(h.length<2)){var f=h[1];if(Array.isArray(f)&&!(f.length<1)){var R=f[0];if(R!="noop"&&R!="stop"&&R!="close")for(let x=1;x<f.length;x++)f[x]=""}}}}return lo(S)}catch(S){return u}}var bs={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Sc={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Vc;function po(){}m(po,wc),po.prototype.g=function(){return new XMLHttpRequest},Vc=new po;function gr(o){return encodeURIComponent(String(o))}function jf(o){var u=1;o=o.split(":");const h=[];for(;u>0&&o.length;)h.push(o.shift()),u--;return o.length&&h.push(o.join(":")),h}function bt(o,u,h,f){this.j=o,this.i=u,this.l=h,this.S=f||1,this.V=new hr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Cc}function Cc(){this.i=null,this.g="",this.h=!1}var bc={},mo={};function go(o,u,h){o.M=1,o.A=ks(it(u)),o.u=h,o.R=!0,Nc(o,null)}function Nc(o,u){o.F=Date.now(),Ns(o),o.B=it(o.A);var h=o.B,f=o.S;Array.isArray(f)||(f=[String(f)]),zc(h.i,"t",f),o.C=0,h=o.j.L,o.h=new Cc,o.g=cu(o.j,h?u:null,!o.u),o.P>0&&(o.O=new Lf(d(o.Y,o,o.g),o.P)),u=o.V,h=o.g,f=o.ba;var R="readystatechange";Array.isArray(R)||(R&&(Ec[0]=R.toString()),R=Ec);for(let S=0;S<R.length;S++){const x=pc(h,R[S],f||u.handleEvent,!1,u.h||u);if(!x)break;u.g[x.key]=x}u=o.J?hc(o.J):{},o.u?(o.v||(o.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,u)):(o.v="GET",o.g.ea(o.B,o.v,null,u)),fr(),Ff(o.i,o.v,o.B,o.l,o.S,o.u)}bt.prototype.ba=function(o){o=o.target;const u=this.O;u&&Dt(o)==3?u.j():this.Y(o)},bt.prototype.Y=function(o){try{if(o==this.g)e:{const W=Dt(this.g),ye=this.g.ya(),ne=this.g.ca();if(!(W<3)&&(W!=3||this.g&&(this.h.h||this.g.la()||Jc(this.g)))){this.K||W!=4||ye==7||(ye==8||ne<=0?fr(3):fr(2)),_o(this);var u=this.g.ca();this.X=u;var h=zf(this);if(this.o=u==200,Bf(this.i,this.v,this.B,this.l,this.S,W,u),this.o){if(this.U&&!this.L){t:{if(this.g){var f,R=this.g;if((f=R.g?R.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(f)){var S=f;break t}}S=null}if(o=S)kn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,yo(this,o);else{this.o=!1,this.m=3,xe(12),dn(this),_r(this);break e}}if(this.R){o=!0;let we;for(;!this.K&&this.C<h.length;)if(we=Hf(this,h),we==mo){W==4&&(this.m=4,xe(14),o=!1),kn(this.i,this.l,null,"[Incomplete Response]");break}else if(we==bc){this.m=4,xe(15),kn(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else kn(this.i,this.l,we,null),yo(this,we);if(kc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),W!=4||h.length!=0||this.h.h||(this.m=1,xe(16),o=!1),this.o=this.o&&o,!o)kn(this.i,this.l,h,"[Invalid Chunked Response]"),dn(this),_r(this);else if(h.length>0&&!this.W){this.W=!0;var x=this.j;x.g==this&&x.aa&&!x.P&&(x.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),Po(x),x.P=!0,xe(11))}}else kn(this.i,this.l,h,null),yo(this,h);W==4&&dn(this),this.o&&!this.K&&(W==4?su(this.j,this):(this.o=!1,Ns(this)))}else ip(this.g),u==400&&h.indexOf("Unknown SID")>0?(this.m=3,xe(12)):(this.m=0,xe(13)),dn(this),_r(this)}}}catch(W){}finally{}};function zf(o){if(!kc(o))return o.g.la();const u=Jc(o.g);if(u==="")return"";let h="";const f=u.length,R=Dt(o.g)==4;if(!o.h.i){if(typeof TextDecoder=="undefined")return dn(o),_r(o),"";o.h.i=new a.TextDecoder}for(let S=0;S<f;S++)o.h.h=!0,h+=o.h.i.decode(u[S],{stream:!(R&&S==f-1)});return u.length=0,o.h.g+=h,o.C=0,o.h.g}function kc(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function Hf(o,u){var h=o.C,f=u.indexOf(`
`,h);return f==-1?mo:(h=Number(u.substring(h,f)),isNaN(h)?bc:(f+=1,f+h>u.length?mo:(u=u.slice(f,f+h),o.C=f+h,u)))}bt.prototype.cancel=function(){this.K=!0,dn(this)};function Ns(o){o.T=Date.now()+o.H,Dc(o,o.H)}function Dc(o,u){if(o.D!=null)throw Error("WatchDog timer not null");o.D=pr(d(o.aa,o),u)}function _o(o){o.D&&(a.clearTimeout(o.D),o.D=null)}bt.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?($f(this.i,this.B),this.M!=2&&(fr(),xe(17)),dn(this),this.m=2,_r(this)):Dc(this,this.T-o)};function _r(o){o.j.I==0||o.K||su(o.j,o)}function dn(o){_o(o);var u=o.O;u&&typeof u.dispose=="function"&&u.dispose(),o.O=null,Tc(o.V),o.g&&(u=o.g,o.g=null,u.abort(),u.dispose())}function yo(o,u){try{var h=o.j;if(h.I!=0&&(h.g==o||Eo(h.h,o))){if(!o.L&&Eo(h.h,o)&&h.I==3){try{var f=h.Ba.g.parse(u)}catch(ne){f=null}if(Array.isArray(f)&&f.length==3){var R=f;if(R[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)Ms(h),Os(h);else break e;Ro(h),xe(18)}}else h.xa=R[1],0<h.xa-h.K&&R[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=pr(d(h.Va,h),6e3));Lc(h.h)<=1&&h.ta&&(h.ta=void 0)}else pn(h,11)}else if((o.L||h.g==o)&&Ms(h),!y(u))for(R=h.Ba.g.parse(u),u=0;u<R.length;u++){let ne=R[u];const we=ne[0];if(!(we<=h.K))if(h.K=we,ne=ne[1],h.I==2)if(ne[0]=="c"){h.M=ne[1],h.ba=ne[2];const ot=ne[3];ot!=null&&(h.ka=ot,h.j.info("VER="+h.ka));const mn=ne[4];mn!=null&&(h.za=mn,h.j.info("SVER="+h.za));const xt=ne[5];xt!=null&&typeof xt=="number"&&xt>0&&(f=1.5*xt,h.O=f,h.j.info("backChannelRequestTimeoutMs_="+f)),f=h;const Ot=o.g;if(Ot){const Fs=Ot.g?Ot.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Fs){var S=f.h;S.g||Fs.indexOf("spdy")==-1&&Fs.indexOf("quic")==-1&&Fs.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(To(S,S.h),S.h=null))}if(f.G){const So=Ot.g?Ot.g.getResponseHeader("X-HTTP-Session-Id"):null;So&&(f.wa=So,se(f.J,f.G,So))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),f=h;var x=o;if(f.na=au(f,f.L?f.ba:null,f.W),x.L){Mc(f.h,x);var W=x,ye=f.O;ye&&(W.H=ye),W.D&&(_o(W),Ns(W)),f.g=x}else nu(f);h.i.length>0&&Ls(h)}else ne[0]!="stop"&&ne[0]!="close"||pn(h,7);else h.I==3&&(ne[0]=="stop"||ne[0]=="close"?ne[0]=="stop"?pn(h,7):Ao(h):ne[0]!="noop"&&h.l&&h.l.qa(ne),h.A=0)}}fr(4)}catch(ne){}}var Wf=class{constructor(o,u){this.g=o,this.map=u}};function xc(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Oc(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Lc(o){return o.h?1:o.g?o.g.size:0}function Eo(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function To(o,u){o.g?o.g.add(u):o.h=u}function Mc(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}xc.prototype.cancel=function(){if(this.i=Uc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Uc(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const h of o.g.values())u=u.concat(h.G);return u}return V(o.i)}var Fc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Gf(o,u){if(o){o=o.split("&");for(let h=0;h<o.length;h++){const f=o[h].indexOf("=");let R,S=null;f>=0?(R=o[h].substring(0,f),S=o[h].substring(f+1)):R=o[h],u(R,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function Nt(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;o instanceof Nt?(this.l=o.l,yr(this,o.j),this.o=o.o,this.g=o.g,Er(this,o.u),this.h=o.h,wo(this,Hc(o.i)),this.m=o.m):o&&(u=String(o).match(Fc))?(this.l=!1,yr(this,u[1]||"",!0),this.o=Tr(u[2]||""),this.g=Tr(u[3]||"",!0),Er(this,u[4]),this.h=Tr(u[5]||"",!0),wo(this,u[6]||"",!0),this.m=Tr(u[7]||"")):(this.l=!1,this.i=new Ir(null,this.l))}Nt.prototype.toString=function(){const o=[];var u=this.j;u&&o.push(wr(u,Bc,!0),":");var h=this.g;return(h||u=="file")&&(o.push("//"),(u=this.o)&&o.push(wr(u,Bc,!0),"@"),o.push(gr(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(wr(h,h.charAt(0)=="/"?Yf:Qf,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",wr(h,Xf)),o.join("")},Nt.prototype.resolve=function(o){const u=it(this);let h=!!o.j;h?yr(u,o.j):h=!!o.o,h?u.o=o.o:h=!!o.g,h?u.g=o.g:h=o.u!=null;var f=o.h;if(h)Er(u,o.u);else if(h=!!o.h){if(f.charAt(0)!="/")if(this.g&&!this.h)f="/"+f;else{var R=u.h.lastIndexOf("/");R!=-1&&(f=u.h.slice(0,R+1)+f)}if(R=f,R==".."||R==".")f="";else if(R.indexOf("./")!=-1||R.indexOf("/.")!=-1){f=R.lastIndexOf("/",0)==0,R=R.split("/");const S=[];for(let x=0;x<R.length;){const W=R[x++];W=="."?f&&x==R.length&&S.push(""):W==".."?((S.length>1||S.length==1&&S[0]!="")&&S.pop(),f&&x==R.length&&S.push("")):(S.push(W),f=!0)}f=S.join("/")}else f=R}return h?u.h=f:h=o.i.toString()!=="",h?wo(u,Hc(o.i)):h=!!o.m,h&&(u.m=o.m),u};function it(o){return new Nt(o)}function yr(o,u,h){o.j=h?Tr(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function Er(o,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);o.u=u}else o.u=null}function wo(o,u,h){u instanceof Ir?(o.i=u,Zf(o.i,o.l)):(h||(u=wr(u,Jf)),o.i=new Ir(u,o.l))}function se(o,u,h){o.i.set(u,h)}function ks(o){return se(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function Tr(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function wr(o,u,h){return typeof o=="string"?(o=encodeURI(o).replace(u,Kf),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Kf(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Bc=/[#\/\?@]/g,Qf=/[#\?:]/g,Yf=/[#\?]/g,Jf=/[#\?@]/g,Xf=/#/g;function Ir(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function fn(o){o.g||(o.g=new Map,o.h=0,o.i&&Gf(o.i,function(u,h){o.add(decodeURIComponent(u.replace(/\+/g," ")),h)}))}n=Ir.prototype,n.add=function(o,u){fn(this),this.i=null,o=Dn(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(u),this.h+=1,this};function $c(o,u){fn(o),u=Dn(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function qc(o,u){return fn(o),u=Dn(o,u),o.g.has(u)}n.forEach=function(o,u){fn(this),this.g.forEach(function(h,f){h.forEach(function(R){o.call(u,R,f,this)},this)},this)};function jc(o,u){fn(o);let h=[];if(typeof u=="string")qc(o,u)&&(h=h.concat(o.g.get(Dn(o,u))));else for(o=Array.from(o.g.values()),u=0;u<o.length;u++)h=h.concat(o[u]);return h}n.set=function(o,u){return fn(this),this.i=null,o=Dn(this,o),qc(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=jc(this,o),o.length>0?String(o[0]):u):u};function zc(o,u,h){$c(o,u),h.length>0&&(o.i=null,o.g.set(Dn(o,u),V(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(let f=0;f<u.length;f++){var h=u[f];const R=gr(h);h=jc(this,h);for(let S=0;S<h.length;S++){let x=R;h[S]!==""&&(x+="="+gr(h[S])),o.push(x)}}return this.i=o.join("&")};function Hc(o){const u=new Ir;return u.i=o.i,o.g&&(u.g=new Map(o.g),u.h=o.h),u}function Dn(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Zf(o,u){u&&!o.j&&(fn(o),o.i=null,o.g.forEach(function(h,f){const R=f.toLowerCase();f!=R&&($c(this,f),zc(this,R,h))},o)),o.j=u}function ep(o,u){const h=new mr;if(a.Image){const f=new Image;f.onload=p(kt,h,"TestLoadImage: loaded",!0,u,f),f.onerror=p(kt,h,"TestLoadImage: error",!1,u,f),f.onabort=p(kt,h,"TestLoadImage: abort",!1,u,f),f.ontimeout=p(kt,h,"TestLoadImage: timeout",!1,u,f),a.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=o}else u(!1)}function tp(o,u){const h=new mr,f=new AbortController,R=setTimeout(()=>{f.abort(),kt(h,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:f.signal}).then(S=>{clearTimeout(R),S.ok?kt(h,"TestPingServer: ok",!0,u):kt(h,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(R),kt(h,"TestPingServer: error",!1,u)})}function kt(o,u,h,f,R){try{R&&(R.onload=null,R.onerror=null,R.onabort=null,R.ontimeout=null),f(h)}catch(S){}}function np(){this.g=new Uf}function Io(o){this.i=o.Sb||null,this.h=o.ab||!1}m(Io,wc),Io.prototype.g=function(){return new Ds(this.i,this.h)};function Ds(o,u){Pe.call(this),this.H=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(Ds,Pe),n=Ds.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=u,this.readyState=1,Ar(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(u.body=o),(this.H||a).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,vr(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Ar(this)),this.g&&(this.readyState=3,Ar(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream!="undefined"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Wc(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Wc(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?vr(this):Ar(this),this.readyState==3&&Wc(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,vr(this))},n.Na=function(o){this.g&&(this.response=o,vr(this))},n.ga=function(){this.g&&vr(this)};function vr(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Ar(o)}n.setRequestHeader=function(o,u){this.A.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var h=u.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=u.next();return o.join(`\r
`)};function Ar(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Ds.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Gc(o){let u="";return Ps(o,function(h,f){u+=f,u+=":",u+=h,u+=`\r
`}),u}function vo(o,u,h){e:{for(f in h){var f=!1;break e}f=!0}f||(h=Gc(h),typeof o=="string"?h!=null&&gr(h):se(o,u,h))}function ce(o){Pe.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(ce,Pe);var rp=/^https?$/i,sp=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,u,h,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Vc.g(),this.g.onreadystatechange=w(d(this.Ca,this));try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(S){Kc(this,S);return}if(o=h||"",h=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var R in f)h.set(R,f[R]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const S of f.keys())h.set(S,f.get(S));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(h.keys()).find(S=>S.toLowerCase()=="content-type"),R=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(sp,u,void 0)>=0)||f||R||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,x]of h)this.g.setRequestHeader(S,x);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(S){Kc(this,S)}};function Kc(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.o=5,Qc(o),xs(o)}function Qc(o){o.A||(o.A=!0,De(o,"complete"),De(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,De(this,"complete"),De(this,"abort"),xs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),xs(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Yc(this):this.Xa())},n.Xa=function(){Yc(this)};function Yc(o){if(o.h&&typeof i!="undefined"){if(o.v&&Dt(o)==4)setTimeout(o.Ca.bind(o),0);else if(De(o,"readystatechange"),Dt(o)==4){o.h=!1;try{const S=o.ca();e:switch(S){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var h;if(!(h=u)){var f;if(f=S===0){let x=String(o.D).match(Fc)[1]||null;!x&&a.self&&a.self.location&&(x=a.self.location.protocol.slice(0,-1)),f=!rp.test(x?x.toLowerCase():"")}h=f}if(h)De(o,"complete"),De(o,"success");else{o.o=6;try{var R=Dt(o)>2?o.g.statusText:""}catch(x){R=""}o.l=R+" ["+o.ca()+"]",Qc(o)}}finally{xs(o)}}}}function xs(o,u){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const h=o.g;o.g=null,u||De(o,"ready");try{h.onreadystatechange=null}catch(f){}}}n.isActive=function(){return!!this.g};function Dt(o){return o.g?o.g.readyState:0}n.ca=function(){try{return Dt(this)>2?this.g.status:-1}catch(o){return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch(o){return""}},n.La=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Mf(u)}};function Jc(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch(u){return null}}function ip(o){const u={};o=(o.g&&Dt(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<o.length;f++){if(y(o[f]))continue;var h=jf(o[f]);const R=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const S=u[R]||[];u[R]=S,S.push(h)}Nf(u,function(f){return f.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Rr(o,u,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||u}function Xc(o){this.za=0,this.i=[],this.j=new mr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Rr("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Rr("baseRetryDelayMs",5e3,o),this.Za=Rr("retryDelaySeedMs",1e4,o),this.Ta=Rr("forwardChannelMaxRetries",2,o),this.va=Rr("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new xc(o&&o.concurrentRequestLimit),this.Ba=new np,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Xc.prototype,n.ka=8,n.I=1,n.connect=function(o,u,h,f){xe(0),this.W=o,this.H=u||{},h&&f!==void 0&&(this.H.OSID=h,this.H.OAID=f),this.F=this.X,this.J=au(this,null,this.W),Ls(this)};function Ao(o){if(Zc(o),o.I==3){var u=o.V++,h=it(o.J);if(se(h,"SID",o.M),se(h,"RID",u),se(h,"TYPE","terminate"),Pr(o,h),u=new bt(o,o.j,u),u.M=2,u.A=ks(it(h)),h=!1,a.navigator&&a.navigator.sendBeacon)try{h=a.navigator.sendBeacon(u.A.toString(),"")}catch(f){}!h&&a.Image&&(new Image().src=u.A,h=!0),h||(u.g=cu(u.j,null),u.g.ea(u.A)),u.F=Date.now(),Ns(u)}ou(o)}function Os(o){o.g&&(Po(o),o.g.cancel(),o.g=null)}function Zc(o){Os(o),o.v&&(a.clearTimeout(o.v),o.v=null),Ms(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function Ls(o){if(!Oc(o.h)&&!o.m){o.m=!0;var u=o.Ea;ge||g(),_e||(ge(),_e=!0),v.add(u,o),o.D=0}}function op(o,u){return Lc(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=u.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=pr(d(o.Ea,o,u),iu(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const R=new bt(this,this.j,o);let S=this.o;if(this.U&&(S?(S=hc(S),fc(S,this.U)):S=this.U),this.u!==null||this.R||(R.J=S,S=null),this.S)e:{for(var u=0,h=0;h<this.i.length;h++){t:{var f=this.i[h];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(u+=f,u>4096){u=h;break e}if(u===4096||h===this.i.length-1){u=h+1;break e}}u=1e3}else u=1e3;u=tu(this,R,u),h=it(this.J),se(h,"RID",o),se(h,"CVER",22),this.G&&se(h,"X-HTTP-Session-Id",this.G),Pr(this,h),S&&(this.R?u="headers="+gr(Gc(S))+"&"+u:this.u&&vo(h,this.u,S)),To(this.h,R),this.Ra&&se(h,"TYPE","init"),this.S?(se(h,"$req",u),se(h,"SID","null"),R.U=!0,go(R,h,null)):go(R,h,u),this.I=2}}else this.I==3&&(o?eu(this,o):this.i.length==0||Oc(this.h)||eu(this))};function eu(o,u){var h;u?h=u.l:h=o.V++;const f=it(o.J);se(f,"SID",o.M),se(f,"RID",h),se(f,"AID",o.K),Pr(o,f),o.u&&o.o&&vo(f,o.u,o.o),h=new bt(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),u&&(o.i=u.G.concat(o.i)),u=tu(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),To(o.h,h),go(h,f,u)}function Pr(o,u){o.H&&Ps(o.H,function(h,f){se(u,f,h)}),o.l&&Ps({},function(h,f){se(u,f,h)})}function tu(o,u,h){h=Math.min(o.i.length,h);const f=o.l?d(o.l.Ka,o.l,o):null;e:{var R=o.i;let W=-1;for(;;){const ye=["count="+h];W==-1?h>0?(W=R[0].g,ye.push("ofs="+W)):W=0:ye.push("ofs="+W);let ne=!0;for(let we=0;we<h;we++){var S=R[we].g;const ot=R[we].map;if(S-=W,S<0)W=Math.max(0,R[we].g-100),ne=!1;else try{S="req"+S+"_"||"";try{var x=ot instanceof Map?ot:Object.entries(ot);for(const[mn,xt]of x){let Ot=xt;c(xt)&&(Ot=lo(xt)),ye.push(S+mn+"="+encodeURIComponent(Ot))}}catch(mn){throw ye.push(S+"type="+encodeURIComponent("_badmap")),mn}}catch(mn){f&&f(ot)}}if(ne){x=ye.join("&");break e}}x=void 0}return o=o.i.splice(0,h),u.G=o,x}function nu(o){if(!o.g&&!o.v){o.Y=1;var u=o.Da;ge||g(),_e||(ge(),_e=!0),v.add(u,o),o.A=0}}function Ro(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=pr(d(o.Da,o),iu(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,ru(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=pr(d(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,xe(10),Os(this),ru(this))};function Po(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function ru(o){o.g=new bt(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var u=it(o.na);se(u,"RID","rpc"),se(u,"SID",o.M),se(u,"AID",o.K),se(u,"CI",o.F?"0":"1"),!o.F&&o.ia&&se(u,"TO",o.ia),se(u,"TYPE","xmlhttp"),Pr(o,u),o.u&&o.o&&vo(u,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=ks(it(u)),h.u=null,h.R=!0,Nc(h,o)}n.Va=function(){this.C!=null&&(this.C=null,Os(this),Ro(this),xe(19))};function Ms(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function su(o,u){var h=null;if(o.g==u){Ms(o),Po(o),o.g=null;var f=2}else if(Eo(o.h,u))h=u.G,Mc(o.h,u),f=1;else return;if(o.I!=0){if(u.o)if(f==1){h=u.u?u.u.length:0,u=Date.now()-u.F;var R=o.D;f=Cs(),De(f,new Pc(f,h)),Ls(o)}else nu(o);else if(R=u.m,R==3||R==0&&u.X>0||!(f==1&&op(o,u)||f==2&&Ro(o)))switch(h&&h.length>0&&(u=o.h,u.i=u.i.concat(h)),R){case 1:pn(o,5);break;case 4:pn(o,10);break;case 3:pn(o,6);break;default:pn(o,2)}}}function iu(o,u){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*u}function pn(o,u){if(o.j.info("Error code "+u),u==2){var h=d(o.bb,o),f=o.Ua;const R=!f;f=new Nt(f||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||yr(f,"https"),ks(f),R?ep(f.toString(),h):tp(f.toString(),h)}else xe(2);o.I=0,o.l&&o.l.pa(u),ou(o),Zc(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),xe(2)):(this.j.info("Failed to ping google.com"),xe(1))};function ou(o){if(o.I=0,o.ja=[],o.l){const u=Uc(o.h);(u.length!=0||o.i.length!=0)&&(k(o.ja,u),k(o.ja,o.i),o.h.i.length=0,V(o.i),o.i.length=0),o.l.oa()}}function au(o,u,h){var f=h instanceof Nt?it(h):new Nt(h);if(f.g!="")u&&(f.g=u+"."+f.g),Er(f,f.u);else{var R=a.location;f=R.protocol,u=u?u+"."+R.hostname:R.hostname,R=+R.port;const S=new Nt(null);f&&yr(S,f),u&&(S.g=u),R&&Er(S,R),h&&(S.h=h),f=S}return h=o.G,u=o.wa,h&&u&&se(f,h,u),se(f,"VER",o.ka),Pr(o,f),f}function cu(o,u,h){if(u&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Aa&&!o.ma?new ce(new Io({ab:h})):new ce(o.ma),u.Fa(o.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function uu(){}n=uu.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Us(){}Us.prototype.g=function(o,u){return new He(o,u)};function He(o,u){Pe.call(this),this.g=new Xc(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(o?o["X-WebChannel-Client-Profile"]=u.sa:o={"X-WebChannel-Client-Profile":u.sa}),this.g.U=o,(o=u&&u.Qb)&&!y(o)&&(this.g.u=o),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!y(u)&&(this.g.G=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new xn(this)}m(He,Pe),He.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},He.prototype.close=function(){Ao(this.g)},He.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=lo(o),o=h);u.i.push(new Wf(u.Ya++,o)),u.I==3&&Ls(u)},He.prototype.N=function(){this.g.l=null,delete this.j,Ao(this.g),delete this.g,He.Z.N.call(this)};function lu(o){ho.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const h in u){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}m(lu,ho);function hu(){fo.call(this),this.status=1}m(hu,fo);function xn(o){this.g=o}m(xn,uu),xn.prototype.ra=function(){De(this.g,"a")},xn.prototype.qa=function(o){De(this.g,new lu(o))},xn.prototype.pa=function(o){De(this.g,new hu)},xn.prototype.oa=function(){De(this.g,"b")},Us.prototype.createWebChannel=Us.prototype.g,He.prototype.send=He.prototype.o,He.prototype.open=He.prototype.m,He.prototype.close=He.prototype.close,xh=function(){return new Us},Dh=function(){return Cs()},kh=hn,zo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},bs.NO_ERROR=0,bs.TIMEOUT=8,bs.HTTP_ERROR=6,Zs=bs,Sc.COMPLETE="complete",Nh=Sc,Ic.EventType=dr,dr.OPEN="a",dr.CLOSE="b",dr.ERROR="c",dr.MESSAGE="d",Pe.prototype.listen=Pe.prototype.J,kr=Ic,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,bh=ce}).apply(typeof qs!="undefined"?qs:typeof self!="undefined"?self:typeof window!="undefined"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sr="12.19.0";function q_(n){sr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt=new ha("@firebase/firestore");function On(){return Yt.logLevel}function QI(n){Yt.setLogLevel(n)}function O(n,...e){if(Yt.logLevel<=J.DEBUG){const t=e.map(wa);Yt.debug(`Firestore (${sr}): ${n}`,...t)}}function Pt(n,...e){if(Yt.logLevel<=J.ERROR){const t=e.map(wa);Yt.error(`Firestore (${sr}): ${n}`,...t)}}function st(n,...e){if(Yt.logLevel<=J.WARN){const t=e.map(wa);Yt.warn(`Firestore (${sr}): ${n}`,...t)}}function wa(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch(e){return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Oh(n,r,t)}function Oh(n,e,t){let r=`FIRESTORE (${sr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch(s){r+=" CONTEXT: "+t}throw Pt(r),new Error(r)}function F(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Oh(e,s,r)}function H(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j_(n){const e=typeof self!="undefined"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ia{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=j_(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function Y(n,e){return n<e?-1:n>e?1:0}function Ho(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return ko(s)===ko(i)?Y(s,i):ko(s)?1:-1}return Y(n.length,e.length)}const z_=55296,H_=57343;function ko(n){const e=n.charCodeAt(0);return e>=z_&&e<=H_}function Gn(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e,t){this.comparator=e,this.root=t||Ae.EMPTY}insert(e,t){return new ie(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ae.BLACK,null,null))}remove(e){return new ie(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ae.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new js(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new js(this.root,e,this.comparator,!1)}getReverseIterator(){return new js(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new js(this.root,e,this.comparator,!0)}}class js{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ae{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r!=null?r:Ae.RED,this.left=s!=null?s:Ae.EMPTY,this.right=i!=null?i:Ae.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Ae(e!=null?e:this.key,t!=null?t:this.value,r!=null?r:this.color,s!=null?s:this.left,i!=null?i:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Ae.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Ae.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ae.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ae.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw $(43730,{key:this.key,value:this.value});if(this.right.isRed())throw $(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw $(27949);return e+(this.isRed()?0:1)}}Ae.EMPTY=null,Ae.RED=!0,Ae.BLACK=!1;Ae.EMPTY=new class{constructor(){this.size=0}get key(){throw $(57766)}get value(){throw $(16141)}get color(){throw $(16727)}get left(){throw $(29726)}get right(){throw $(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Ae(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.comparator=e,this.data=new ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ju(this.data.getIterator())}getIteratorFrom(e){return new ju(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class ju{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class L extends Vt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kn="__name__";class at{constructor(e,t,r){t===void 0?t=0:t>e.length&&$(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&$(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return at.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof at?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=at.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Y(e.length,t.length)}static compareSegments(e,t){const r=at.isNumericId(e),s=at.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?at.extractNumericId(e).compare(at.extractNumericId(t)):Ho(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return zt.fromString(e.substring(4,e.length-2))}}class ee extends at{construct(e,t,r){return new ee(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new L(N.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new ee(t)}static emptyPath(){return new ee([])}}const W_=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Qe=class Ln extends at{construct(e,t,r){return new Ln(e,t,r)}static isValidIdentifier(e){return W_.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ln.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Kn}static keyField(){return new Ln([Kn])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new L(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new L(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new L(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new L(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ln(t)}static emptyPath(){return new Ln([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(e){this.fields=e,e.sort(Qe.comparator)}static empty(){return new Ge([])}unionWith(e){let t=new de(Qe.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ge(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Gn(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fi(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function cn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function G_(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Lh(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.path=e}static fromPath(e){return new B(ee.fromString(e))}static fromName(e){return new B(ee.fromString(e).popFirst(5))}static empty(){return new B(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new B(new ee(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mh(n,e,t){if(!t)throw new L(N.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function K_(n,e,t,r){if(e===!0&&r===!0)throw new L(N.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function zu(n){if(!B.isDocumentKey(n))throw new L(N.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Hu(n){if(B.isDocumentKey(n))throw new L(N.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ms(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function va(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":$(12329,{type:typeof n})}function Ye(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new L(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=va(n);throw new L(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function gs(n,e){if(!ms(n))throw new L(N.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new L(N.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wu=-62135596800,Gu=1e6;class te{static now(){return te.fromMillis(Date.now())}static fromDate(e){return te.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Gu);return new te(t,r)}static fromInstant(e){if(!e||typeof e.t!="bigint")throw new L(N.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return te._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,r;if(e>=BigInt(0))t=Number(e/BigInt(1000000000)),r=Number(e%BigInt(1000000000));else{const s=e%BigInt(1000000000);s===BigInt(0)?(t=Number(e/BigInt(1000000000)),r=0):(t=Number(e/BigInt(1000000000)-BigInt(1)),r=Number(s+BigInt(1000000000)))}return new te(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new L(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new L(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Wu)throw new L(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new L(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Gu}toInstant(){if(typeof Temporal=="undefined"||!Temporal.Instant)throw new L(N.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=BigInt(1000000000)*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?Y(this.nanoseconds,e.nanoseconds):Y(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:te._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(gs(e,te._jsonSchema))return new te(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Wu;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}te._jsonSchemaVersion="firestore/timestamp/1.0",te._jsonSchema={type:he("string",te._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException!="undefined"&&i instanceof DOMException?new Uh("Invalid base64 string: "+i):i}})(e);return new pe(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new pe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Y(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}pe.EMPTY_BYTE_STRING=new pe("");const Q_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Jt(n){if(F(!!n,39018),typeof n=="string"){let e=0;const t=Q_.exec(n);if(F(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:oe(n.seconds),nanos:oe(n.nanos)}}function oe(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Xt(n){return typeof n=="string"?pe.fromBase64String(n):pe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fh="server_timestamp",Bh="__type__",$h="__previous_value__",qh="__local_write_time__";function xi(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Bh])==null?void 0:r.stringValue)===Fh}function _s(n){const e=n.mapValue.fields[$h];return xi(e)?_s(e):e}function Qn(n){const e=Jt(n.mapValue.fields[qh].timestampValue);return new te(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y_{constructor(e,t,r,s,i,a,c,l,d,p,m,w,V){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=d,this.isUsingEmulator=p,this.apiKey=m,this._customHeaders=w,this.grpcFlowControlWindow=V}}const Wo="(default)";class Kr{constructor(e,t){this.projectId=e,this.database=t||Wo}static empty(){return new Kr("","")}get isDefaultDatabase(){return this.database===Wo}isEqual(e){return e instanceof Kr&&e.projectId===this.projectId&&e.database===this.database}}function J_(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new L(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Kr(n.options.projectId,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Aa=-1;function Oi(n){return n==null}function Qr(n){return n===0&&1/n==-1/0}function X_(n){return typeof n=="number"&&Number.isInteger(n)&&!Qr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function Z_(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jh="__type__",ey="__max__",zs={mapValue:{}},zh="__vector__",Yr="value",Yn={nullValue:"NULL_VALUE"},qe={booleanValue:!0},ve={booleanValue:!1};function me(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?xi(n)?4:ty(n)?9007199254740991:pi(n)?10:11:$(28295,{value:n})}function et(n,e,t){if(n===e)return!0;const r=me(n);if(r!==me(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Qn(n).isEqual(Qn(e));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const c=Jt(i.timestampValue),l=Jt(a.timestampValue);return c.seconds===l.seconds&&c.nanos===l.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,a){return Xt(i.bytesValue).isEqual(Xt(a.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,a){return oe(i.geoPointValue.latitude)===oe(a.geoPointValue.latitude)&&oe(i.geoPointValue.longitude)===oe(a.geoPointValue.longitude)})(n,e);case 2:return(function(i,a,c){var p,m;if("integerValue"in i&&"integerValue"in a)return oe(i.integerValue)===oe(a.integerValue);let l,d;if("doubleValue"in i&&"doubleValue"in a)l=oe(i.doubleValue),d=oe(a.doubleValue);else{if(!(c!=null&&c.i))return!1;l=oe((p=i.integerValue)!=null?p:i.doubleValue),d=oe((m=a.integerValue)!=null?m:a.doubleValue)}return l===d?!!(c!=null&&c.o)||Qr(l)===Qr(d):!!(c===void 0||c.u)&&isNaN(l)&&isNaN(d)})(n,e,t);case 9:return Gn(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>et(s,i,t)));case 10:case 11:return(function(i,a,c){const l=i.mapValue.fields||{},d=a.mapValue.fields||{};if(fi(l)!==fi(d))return!1;for(const p in l)if(l.hasOwnProperty(p)&&(d[p]===void 0||!et(l[p],d[p],c)))return!1;return!0})(n,e,t);default:return $(52216,{left:n})}}function Jr(n,e){return(n.values||[]).find((t=>et(t,e)))!==void 0}function je(n,e){if(n===e)return 0;const t=me(n),r=me(e);if(t!==r)return Y(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Y(n.booleanValue,e.booleanValue);case 2:return(function(i,a){const c=oe(i.integerValue||i.doubleValue),l=oe(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1})(n,e);case 3:return Ku(n.timestampValue,e.timestampValue);case 4:return Ku(Qn(n),Qn(e));case 5:return Ho(n.stringValue,e.stringValue);case 6:return(function(i,a){const c=Xt(i),l=Xt(a);return c.compareTo(l)})(n.bytesValue,e.bytesValue);case 7:return(function(i,a){const c=i.split("/"),l=a.split("/");for(let d=0;d<c.length&&d<l.length;d++){const p=Y(c[d],l[d]);if(p!==0)return p}return Y(c.length,l.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,a){const c=Y(oe(i.latitude),oe(a.latitude));return c!==0?c:Y(oe(i.longitude),oe(a.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return Qu(n.arrayValue,e.arrayValue);case 10:return(function(i,a){var w,V,k,U;const c=i.fields||{},l=a.fields||{},d=(w=c[Yr])==null?void 0:w.arrayValue,p=(V=l[Yr])==null?void 0:V.arrayValue,m=Y(((k=d==null?void 0:d.values)==null?void 0:k.length)||0,((U=p==null?void 0:p.values)==null?void 0:U.length)||0);return m!==0?m:Qu(d,p)})(n.mapValue,e.mapValue);case 11:return(function(i,a){if(i===zs.mapValue&&a===zs.mapValue)return 0;if(i===zs.mapValue)return 1;if(a===zs.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),d=a.fields||{},p=Object.keys(d);l.sort(),p.sort();for(let m=0;m<l.length&&m<p.length;++m){const w=Ho(l[m],p[m]);if(w!==0)return w;const V=je(c[l[m]],d[p[m]]);if(V!==0)return V}return Y(l.length,p.length)})(n.mapValue,e.mapValue);default:throw $(23264,{l:t})}}function Ku(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Y(n,e);const t=Jt(n),r=Jt(e),s=Y(t.seconds,r.seconds);return s!==0?s:Y(t.nanos,r.nanos)}function Qu(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=je(t[s],r[s]);if(i!==void 0&&i!==0)return i}return Y(t.length,r.length)}function Jn(n){return Go(n)}function Go(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=Jt(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return Xt(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return B.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Go(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Go(t.fields[a])}`;return s+"}"})(n.mapValue):$(61005,{value:n})}function ei(n){switch(me(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=_s(n);return e?16+ei(e):16;case 5:return 2*n.stringValue.length;case 6:return Xt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+ei(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return cn(r.fields,((i,a)=>{s+=i.length+ei(a)})),s})(n.mapValue);default:throw $(13486,{value:n})}}function ct(n){return!!n&&"integerValue"in n}function Tn(n){return!!n&&"doubleValue"in n}function Zt(n){return ct(n)||Tn(n)}function Xn(n){return!!n&&"arrayValue"in n}function Ke(n){return!!n&&"nullValue"in n}function ze(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function In(n){return!!n&&"mapValue"in n}function pi(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[jh])==null?void 0:r.stringValue)===zh}function Ko(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[Yr])==null?void 0:t.arrayValue}function Ur(n){if(n.geoPointValue)return{geoPointValue:G({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:G({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return cn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Ur(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ur(n.arrayValue.values[t]);return e}return G({},n)}function ty(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===ey}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e){this.value=e}static empty(){return new Oe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!In(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ur(t)}setAll(e){let t=Qe.emptyPath(),r={},s=[];e.forEach(((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=Ur(a):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());In(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return et(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];In(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){cn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new Oe(Ur(this.value))}}function Hh(n){const e=[];return cn(n.fields,((t,r)=>{const s=new Qe([t]);if(In(r)){const i=Hh(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new Ge(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Li(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Qr(e)?"-0":e}}function Ra(n){return{integerValue:""+n}}function Pa(n,e,t){return X_(e)?Ra(e):Li(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi{constructor(){this._=void 0}}function ny(n,e,t){return n instanceof mi?(function(s,i){const a={fields:{[Bh]:{stringValue:Fh},[qh]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&xi(i)&&(i=_s(i)),i&&(a.fields[$h]=i),{mapValue:a}})(t,e):n instanceof Xr?Gh(n,e):n instanceof Zr?Kh(n,e):n instanceof es?(function(s,i){const a=Wh(s,i),c=yi(a)+yi(s.h);return ct(a)&&ct(s.h)?Ra(c):Li(s.serializer,c)})(n,e):n instanceof gi?(function(s,i){return Yu(s,i,Math.min)})(n,e):n instanceof _i?(function(s,i){return Yu(s,i,Math.max)})(n,e):void 0}function ry(n,e,t){return n instanceof Xr?Gh(n,e):n instanceof Zr?Kh(n,e):t}function Wh(n,e){return n instanceof es?Zt(e)?e:{integerValue:0}:null}class mi extends Mi{}class Xr extends Mi{constructor(e){super(),this.elements=e}}function Gh(n,e){const t=Qh(e);for(const r of n.elements)t.some((s=>et(s,r)))||t.push(r);return{arrayValue:{values:t}}}class Zr extends Mi{constructor(e){super(),this.elements=e}}function Kh(n,e){let t=Qh(e);for(const r of n.elements)t=t.filter((s=>!et(s,r)));return{arrayValue:{values:t}}}class Sa extends Mi{constructor(e,t){super(),this.serializer=e,this.h=t}}class es extends Sa{}class gi extends Sa{}class _i extends Sa{}function Yu(n,e,t){if(!Zt(e))return n.h;const r=t(yi(e),yi(n.h));return ct(e)&&ct(n.h)?Ra(r):Li(n.serializer,r)}function yi(n){return oe(n.integerValue||n.doubleValue)}function Qh(n){return Xn(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function sy(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof Xr&&s instanceof Xr||r instanceof Zr&&s instanceof Zr?Gn(r.elements,s.elements,et):r instanceof es&&s instanceof es||r instanceof gi&&s instanceof gi||r instanceof _i&&s instanceof _i?et(r.h,s.h):r instanceof mi&&s instanceof mi})(n.transform,e.transform)}class iy{constructor(e,t){this.version=e,this.transformResults=t}}class rt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new rt}static exists(e){return new rt(void 0,e)}static updateTime(e){return new rt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ti(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Ui{}function Yh(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Xh(n.key,rt.none()):new ys(n.key,n.data,rt.none());{const t=n.data,r=Oe.empty();let s=new de(Qe.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new un(n.key,r,new Ge(s.toArray()),rt.none())}}function oy(n,e,t){n instanceof ys?(function(s,i,a){const c=s.value.clone(),l=Xu(s.fieldTransforms,i,a.transformResults);c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()})(n,e,t):n instanceof un?(function(s,i,a){if(!ti(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=Xu(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(Jh(s)),l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()})(n,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function Fr(n,e,t,r){return n instanceof ys?(function(i,a,c,l){if(!ti(i.precondition,a))return c;const d=i.value.clone(),p=Zu(i.fieldTransforms,l,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null})(n,e,t,r):n instanceof un?(function(i,a,c,l){if(!ti(i.precondition,a))return c;const d=Zu(i.fieldTransforms,l,a),p=a.data;return p.setAll(Jh(i)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((m=>m.field)))})(n,e,t,r):(function(i,a,c){return ti(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c})(n,e,t)}function ay(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Wh(r.transform,s||null);i!=null&&(t===null&&(t=Oe.empty()),t.set(r.field,i))}return t||null}function Ju(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Gn(r,s,((i,a)=>sy(i,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class ys extends Ui{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class un extends Ui{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Jh(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function Xu(n,e,t){const r=new Map;F(n.length===t.length,32656,{T:t.length,P:n.length});for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,ry(a,c,t[s]))}return r}function Zu(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,ny(i,a,e))}return r}class Xh extends Ui{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class cy extends Ui{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ei{constructor(e,t){this.position=e,this.inclusive=t}}function el(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=B.comparator(B.fromName(a.referenceValue),t.key):r=je(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function tl(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!et(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zh{}class Ee extends Zh{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new ly(e,t,r):t==="array-contains"?new fy(e,r):t==="in"?new py(e,r):t==="not-in"?new my(e,r):t==="array-contains-any"?new gy(e,r):new Ee(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new hy(e,r):new dy(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(je(t,this.value)):t!==null&&me(this.value)===me(t)&&this.matchesComparison(je(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return $(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class pt extends Zh{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new pt(e,t)}matches(e){return ed(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.I!==null||(this.I=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function ed(n){return n.op==="and"}function td(n){return uy(n)&&ed(n)}function uy(n){for(const e of n.filters)if(e instanceof pt)return!1;return!0}function Qo(n){if(n instanceof Ee)return n.field.canonicalString()+n.op.toString()+Jn(n.value);if(td(n))return n.filters.map((e=>Qo(e))).join(",");{const e=n.filters.map((t=>Qo(t))).join(",");return`${n.op}(${e})`}}function nd(n,e){return n instanceof Ee?(function(r,s){return s instanceof Ee&&r.op===s.op&&r.field.isEqual(s.field)&&et(r.value,s.value)})(n,e):n instanceof pt?(function(r,s){return s instanceof pt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,a,c)=>i&&nd(a,s.filters[c])),!0):!1})(n,e):void $(19439)}function rd(n){return n instanceof Ee?(function(t){return`${t.field.canonicalString()} ${t.op} ${Jn(t.value)}`})(n):n instanceof pt?(function(t){return t.op.toString()+" {"+t.getFilters().map(rd).join(" ,")+"}"})(n):"Filter"}class ly extends Ee{constructor(e,t,r){super(e,t,r),this.key=B.fromName(r.referenceValue)}matches(e){const t=B.comparator(e.key,this.key);return this.matchesComparison(t)}}class hy extends Ee{constructor(e,t){super(e,"in",t),this.keys=sd("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class dy extends Ee{constructor(e,t){super(e,"not-in",t),this.keys=sd("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function sd(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>B.fromName(r.referenceValue)))}class fy extends Ee{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Xn(t)&&Jr(t.arrayValue,this.value)}}class py extends Ee{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Jr(this.value.arrayValue,t)}}class my extends Ee{constructor(e,t){super(e,"not-in",t)}matches(e){if(Jr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Jr(this.value.arrayValue,t)}}class gy extends Ee{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Xn(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>Jr(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e,t="asc"){this.field=e,this.dir=t}}function _y(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{static fromTimestamp(e){return new z(e)}static min(){return new z(new te(0,0))}static max(){return new z(new te(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ce(e,0,z.min(),z.min(),z.min(),Oe.empty(),0)}static newFoundDocument(e,t,r,s){return new Ce(e,1,t,z.min(),r,s,0)}static newNoDocument(e,t){return new Ce(e,2,t,z.min(),z.min(),Oe.empty(),0)}static newUnknownDocument(e,t){return new Ce(e,3,t,z.min(),z.min(),Oe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(z.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Oe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Oe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=z.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ce&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ce(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts=-1;function yy(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=z.fromTimestamp(r===1e9?new te(t+1,0):new te(t,r));return new en(s,B.empty(),e)}function Ey(n){return new en(n.readTime,n.key,ts)}class en{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new en(z.min(),B.empty(),ts)}static max(){return new en(z.max(),B.empty(),ts)}}function Ty(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=B.comparator(n.documentKey,e.documentKey),t!==0?t:Y(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wy{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.R=null}}function nl(n,e=null,t=[],r=[],s=null,i=null,a=null){return new wy(n,e,t,r,s,i,a)}function id(n){const e=H(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>Qo(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),Oi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>Jn(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>Jn(r))).join(",")),e.R=t}return e.R}function od(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!_y(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!nd(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!tl(n.startAt,e.startAt)&&tl(n.endAt,e.endAt)}function yn(n){return!!n.isCorePipeline}function ad(n){return!!n.path&&B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fi{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=l,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function Iy(n,e,t,r,s,i,a,c){return new Fi(n,e,t,r,s,i,a,c)}function Bi(n){return new Fi(n)}function rl(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function vy(n){return B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Ay(n){return n.collectionGroup!==null}function Br(n){const e=H(n);if(e.A===null){e.A=[];const t=new Set;for(const i of e.explicitOrderBy)e.A.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new de(Qe.comparator);return a.filters.forEach((l=>{l.getFlattenedFilters().forEach((d=>{d.isInequality()&&(c=c.add(d.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.A.push(new Ti(i,r))})),t.has(Qe.keyField().canonicalString())||e.A.push(new Ti(Qe.keyField(),r))}return e.A}function ht(n){const e=H(n);return e.V||(e.V=Ry(e,Br(n))),e.V}function Ry(n,e){if(n.limitType==="F")return nl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new Ti(s.field,i)}));const t=n.endAt?new Ei(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Ei(n.startAt.position,n.startAt.inclusive):null;return nl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Yo(n,e,t){return new Fi(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Py(n,e){return od(ht(n),ht(e))&&n.limitType===e.limitType}function $r(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>rd(s))).join(", ")}]`),Oi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>Jn(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>Jn(s))).join(",")),`Target(${r})`})(ht(n))}; limitType=${n.limitType})`}function $i(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):B.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of Br(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(a,c,l){const d=el(a,c,l);return a.inclusive?d<=0:d<0})(r.startAt,Br(r),s)||r.endAt&&!(function(a,c,l){const d=el(a,c,l);return a.inclusive?d>=0:d>0})(r.endAt,Br(r),s))})(n,e)}function Va(n){return(e,t)=>{let r=!1;for(const s of Br(n)){const i=Sy(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function Sy(n,e,t){const r=n.field.isKeyField()?B.comparator(e.key,t.key):(function(i,a,c){const l=a.data.field(i),d=c.data.field(i);return l!==null&&d!==null?je(l,d):$(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return $(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vy{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var le,X;function Cy(n){switch(n){case N.OK:return $(64938);case N.CANCELLED:case N.UNKNOWN:case N.DEADLINE_EXCEEDED:case N.RESOURCE_EXHAUSTED:case N.INTERNAL:case N.UNAVAILABLE:case N.UNAUTHENTICATED:return!1;case N.INVALID_ARGUMENT:case N.NOT_FOUND:case N.ALREADY_EXISTS:case N.PERMISSION_DENIED:case N.FAILED_PRECONDITION:case N.ABORTED:case N.OUT_OF_RANGE:case N.UNIMPLEMENTED:case N.DATA_LOSS:return!0;default:return $(15467,{code:n})}}function cd(n){if(n===void 0)return Pt("GRPC error has no .code"),N.UNKNOWN;switch(n){case le.OK:return N.OK;case le.CANCELLED:return N.CANCELLED;case le.UNKNOWN:return N.UNKNOWN;case le.DEADLINE_EXCEEDED:return N.DEADLINE_EXCEEDED;case le.RESOURCE_EXHAUSTED:return N.RESOURCE_EXHAUSTED;case le.INTERNAL:return N.INTERNAL;case le.UNAVAILABLE:return N.UNAVAILABLE;case le.UNAUTHENTICATED:return N.UNAUTHENTICATED;case le.INVALID_ARGUMENT:return N.INVALID_ARGUMENT;case le.NOT_FOUND:return N.NOT_FOUND;case le.ALREADY_EXISTS:return N.ALREADY_EXISTS;case le.PERMISSION_DENIED:return N.PERMISSION_DENIED;case le.FAILED_PRECONDITION:return N.FAILED_PRECONDITION;case le.ABORTED:return N.ABORTED;case le.OUT_OF_RANGE:return N.OUT_OF_RANGE;case le.UNIMPLEMENTED:return N.UNIMPLEMENTED;case le.DATA_LOSS:return N.DATA_LOSS;default:return $(39323,{code:n})}}(X=le||(le={}))[X.OK=0]="OK",X[X.CANCELLED=1]="CANCELLED",X[X.UNKNOWN=2]="UNKNOWN",X[X.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",X[X.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",X[X.NOT_FOUND=5]="NOT_FOUND",X[X.ALREADY_EXISTS=6]="ALREADY_EXISTS",X[X.PERMISSION_DENIED=7]="PERMISSION_DENIED",X[X.UNAUTHENTICATED=16]="UNAUTHENTICATED",X[X.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",X[X.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",X[X.ABORTED=10]="ABORTED",X[X.OUT_OF_RANGE=11]="OUT_OF_RANGE",X[X.UNIMPLEMENTED=12]="UNIMPLEMENTED",X[X.INTERNAL=13]="INTERNAL",X[X.UNAVAILABLE=14]="UNAVAILABLE",X[X.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){cn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return Lh(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by=new ie(B.comparator);function Be(){return by}const ud=new ie(B.comparator);function Mn(...n){let e=ud;for(const t of n)e=e.insert(t.key,t);return e}function ld(n){let e=ud;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function qt(){return qr()}function hd(){return qr()}function qr(){return new Cn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Ny=new ie(B.comparator),ky=new de(B.comparator);function Q(...n){let e=ky;for(const t of n)e=e.add(t);return e}const Dy=new de(Y);function xy(){return Dy}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oy(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ly=new zt([4294967295,4294967295],0);function sl(n){const e=Oy().encode(n),t=new Ch;return t.update(e),new Uint8Array(t.digest())}function il(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new zt([t,r],0),new zt([s,i],0)]}class Ca{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Dr(`Invalid padding: ${t}`);if(r<0)throw new Dr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Dr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Dr(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=zt.fromNumber(this.p)}v(e,t,r){let s=e.add(t.multiply(zt.fromNumber(r)));return s.compare(Ly)===1&&(s=new zt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.p===0)return!1;const t=sl(e),[r,s]=il(t);for(let i=0;i<this.hashCount;i++){const a=this.v(r,s,i);if(!this.D(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Ca(i,s,t);return r.forEach((c=>a.insert(c))),a}insert(e){if(this.p===0)return;const t=sl(e),[r,s]=il(t);for(let i=0;i<this.hashCount;i++){const a=this.v(r,s,i);this.C(a)}}C(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Dr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Es{constructor(e,t,r,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Ts.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Es(z.min(),s,new ie(Y),Be(),Be(),Q())}}class Ts{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Ts(r,t,Q(),Q(),Q())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ni{constructor(e,t,r,s){this.F=e,this.removedTargetIds=t,this.key=r,this.O=s}}class dd{constructor(e,t){this.targetId=e,this.M=t}}class fd{constructor(e,t,r=pe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class ol{constructor(e){this.targetId=e,this.N=0,this.L=al(),this.B=pe.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return this.N!==0}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=Q(),t=Q(),r=Q();return this.L.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:$(38017,{changeType:i})}})),new Ts(this.B,this.U,e,t,r)}G(){this.k=!1,this.L=al()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,F(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const Vr="WatchChangeAggregator";class My{constructor(e){this.X=e,this.ee=new Map,this.te=Be(),this.ne=Hs(),this.re=Be(),this.ie=Hs(),this.se=new ie(Y)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,(t=>{const r=this.ee.get(t);if(r)switch(e.state){case 0:this.ce(t)&&r.K(e.resumeToken);break;case 1:r.Y(),r.q||r.G(),r.K(e.resumeToken);break;case 2:r.Y(),r.q||this.removeTarget(t);break;case 3:this.ce(t)&&(r.Z(),r.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),r.K(e.resumeToken));break;default:$(56790,{state:e.state})}else O(Vr,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach(((r,s)=>{this.ce(s)&&t(s)}))}Ee(e){var t;return yn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:ad(e)}he(e){const t=e.targetId,r=e.M.count,s=this.Te(t);if(s){const i=s.target;if(this.Ee(i))if(r===0){const a=new B(yn(i)?ee.fromString(i.getPipelineDocuments()[0]):i.path);this.ae(t,a,Ce.newNoDocument(a,z.min()))}else F(r===1,20013,"Single document existence filter with count: "+r);else{const a=this.Pe(t);if(a!==r){const c=this.Ie(e),l=c?this.Re(c,e,a):1;if(l!==0){this.le(t);const d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,d)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=Xt(r).toUint8Array()}catch(l){if(l instanceof Uh)return st("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new Ca(a,s,i)}catch(l){return st(l instanceof Dr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.p===0?null:c}Re(e,t,r){return t.M.count===r-this.de(e,t.targetId)?0:2}de(e,t){const r=this.X.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const a=this.X.Ve(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.ae(t,i,null),s++)})),s}fe(e){const t=new Map;this.ee.forEach(((i,a)=>{const c=this.Te(a);if(c){if(i.current&&this.Ee(c.target)){const l=yn(c.target)?ee.fromString(c.target.getPipelineDocuments()[0]):c.target.path,d=new B(l);this.me(d).has(a)||this.pe(a,d)||this.ae(a,d,Ce.newNoDocument(d,e))}i.$&&(t.set(a,i.W()),i.G())}}));let r=Q();this.ie.forEach(((i,a)=>{let c=!0;a.forEachWhile((l=>{const d=this.Te(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.te.forEach(((i,a)=>a.setReadTime(e))),this.re.forEach(((i,a)=>a.setReadTime(e)));const s=new Es(e,t,this.se,this.te,this.re,r);return this.te=Be(),this.ne=Hs(),this.re=Be(),this.ie=Hs(),this.se=new ie(Y),s}oe(e,t){const r=this.ee.get(e);if(!r||!this.ce(e))return void O(Vr,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.pe(e,t.key)?2:0;r.j(t.key,s),yn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,r){const s=this.ee.get(e);s&&this.ce(e)?(this.pe(e,t)?s.j(t,1):s.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),r&&(yn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t,r):this.te=this.te.insert(t,r))):O(Vr,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const r=t.W();return this.X.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}J(e){let t=this.ee.get(e);t||(O(Vr,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new ol(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new de(Y),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new de(Y),this.ne=this.ne.insert(e,t)),t}ce(e){const t=this.Te(e)!==null;return t||O(Vr,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return t===void 0||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new ol(e)),this.X.getRemoteKeysForTarget(e).forEach((t=>{this.ae(e,t,null)}))}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function Hs(){return new ie(B.comparator)}function al(){return new ie(B.comparator)}const Uy={asc:"ASCENDING",desc:"DESCENDING"},Fy={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},By={and:"AND",or:"OR"};class $y{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Jo(n,e){return n.useProto3Json||Oi(e)?e:{value:e}}function jr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ba(n){const e=Jt(n);return new te(e.seconds,e.nanos)}function pd(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function ri(n,e){return jr(n,e.toTimestamp())}function dt(n){return F(!!n,49232),z.fromTimestamp(ba(n))}function Na(n,e){return Xo(n,e).canonicalString()}function Xo(n,e){const t=(function(s){return new ee(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function md(n){const e=ee.fromString(n);return F(Td(e),10190,{key:e.toString()}),e}function wi(n,e){return Na(n.databaseId,e.path)}function Do(n,e){const t=md(e);if(t.get(1)!==n.databaseId.projectId)throw new L(N.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new L(N.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new B(_d(t))}function gd(n,e){return Na(n.databaseId,e)}function qy(n){const e=md(n);return e.length===4?ee.emptyPath():_d(e)}function Zo(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function _d(n){return F(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function cl(n,e,t){return{name:wi(n,e),fields:t.value.mapValue.fields}}function jy(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:$(39313,{state:d})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(d,p){return d.useProto3Json?(F(p===void 0||typeof p=="string",58123),pe.fromBase64String(p||"")):(F(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),pe.fromUint8Array(p||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&(function(d){const p=d.code===void 0?N.UNKNOWN:cd(d.code);return new L(p,d.message||"")})(a);t=new fd(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Do(n,r.document.name),i=dt(r.document.updateTime),a=r.document.createTime?dt(r.document.createTime):z.min(),c=new Oe({mapValue:{fields:r.document.fields}}),l=Ce.newFoundDocument(s,i,a,c),d=r.targetIds||[],p=r.removedTargetIds||[];t=new ni(d,p,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Do(n,r.document),i=r.readTime?dt(r.readTime):z.min(),a=Ce.newNoDocument(s,i),c=r.removedTargetIds||[];t=new ni([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Do(n,r.document),i=r.removedTargetIds||[];t=new ni([],i,s,null)}else{if(!("filter"in e))return $(11601,{we:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new Vy(s,i),c=r.targetId;t=new dd(c,a)}}return t}function zy(n,e){let t;if(e instanceof ys)t={update:cl(n,e.key,e.value)};else if(e instanceof Xh)t={delete:wi(n,e.key)};else if(e instanceof un)t={update:cl(n,e.key,e.data),updateMask:eE(e.fieldMask)};else{if(!(e instanceof cy))return $(16599,{be:e.type});t={verify:wi(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,a){const c=a.transform;if(c instanceof mi)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Xr)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Zr)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof es)return{fieldPath:a.field.canonicalString(),increment:c.h};if(c instanceof gi)return{fieldPath:a.field.canonicalString(),minimum:c.h};if(c instanceof _i)return{fieldPath:a.field.canonicalString(),maximum:c.h};throw $(20930,{transform:a.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:ri(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:$(27497)})(n,e.precondition)),t}function Hy(n,e){return n&&n.length>0?(F(e!==void 0,14353),n.map((t=>(function(s,i){let a=s.updateTime?dt(s.updateTime):dt(i);return a.isEqual(z.min())&&(a=dt(i)),new iy(a,s.transformResults||[])})(t,e)))):[]}function Wy(n,e){return{documents:[gd(n,e.path)]}}function Gy(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=gd(n,s);const i=(function(d){if(d.length!==0)return Ed(pt.create(d,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(d){if(d.length!==0)return d.map((p=>(function(w){return{field:Un(w.field),direction:Jy(w.dir)}})(p)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=Jo(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(d){return{before:d.inclusive,values:d.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(d){return{before:!d.inclusive,values:d.position}})(e.endAt)),{Se:t,parent:s}}function Ky(n){let e=qy(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){F(r===1,65062);const p=t.from[0];p.allDescendants?s=p.collectionId:e=e.child(p.collectionId)}let i=[];t.where&&(i=(function(m){const w=yd(m);return w instanceof pt&&td(w)?w.getFilters():[w]})(t.where));let a=[];t.orderBy&&(a=(function(m){return m.map((w=>(function(k){return new Ti(Fn(k.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(k.direction))})(w)))})(t.orderBy));let c=null;t.limit&&(c=(function(m){let w;return w=typeof m=="object"?m.value:m,Oi(w)?null:w})(t.limit));let l=null;t.startAt&&(l=(function(m){const w=!!m.before,V=m.values||[];return new Ei(V,w)})(t.startAt));let d=null;return t.endAt&&(d=(function(m){const w=!m.before,V=m.values||[];return new Ei(V,w)})(t.endAt)),Iy(e,s,a,i,c,"F",l,d)}function Qy(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return $(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Yy(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function yd(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Fn(t.unaryFilter.field);return Ee.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Fn(t.unaryFilter.field);return Ee.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Fn(t.unaryFilter.field);return Ee.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Fn(t.unaryFilter.field);return Ee.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return $(61313);default:return $(60726)}})(n):n.fieldFilter!==void 0?(function(t){return Ee.create(Fn(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return $(58110);default:return $(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return pt.create(t.compositeFilter.filters.map((r=>yd(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return $(1026)}})(t.compositeFilter.op))})(n):$(30097,{filter:n})}function Jy(n){return Uy[n]}function Xy(n){return Fy[n]}function Zy(n){return By[n]}function Un(n){return{fieldPath:n.canonicalString()}}function Fn(n){return Qe.fromServerFormat(n.fieldPath)}function Ed(n){return n instanceof Ee?(function(t){if(t.op==="=="){if(ze(t.value))return{unaryFilter:{field:Un(t.field),op:"IS_NAN"}};if(Ke(t.value))return{unaryFilter:{field:Un(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ze(t.value))return{unaryFilter:{field:Un(t.field),op:"IS_NOT_NAN"}};if(Ke(t.value))return{unaryFilter:{field:Un(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Un(t.field),op:Xy(t.op),value:t.value}}})(n):n instanceof pt?(function(t){const r=t.getFilters().map((s=>Ed(s)));return r.length===1?r[0]:{compositeFilter:{op:Zy(t.op),filters:r}}})(n):$(54877,{filter:n})}function eE(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Td(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function wd(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function ns(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function Id(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qi(n){return new $y(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Xe(pe.fromBase64String(e))}catch(t){throw new L(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Xe(pe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Xe._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(gs(e,Xe._jsonSchema))return Xe.fromBase64String(e.bytes)}}Xe._jsonSchemaVersion="firestore/bytes/1.0",Xe._jsonSchema={type:he("string",Xe._jsonSchemaVersion),bytes:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ji{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new L(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Qe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function tE(){return new ji(Kn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new L(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new L(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Y(this._lat,e._lat)||Y(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:ft._jsonSchemaVersion}}static fromJSON(e){if(gs(e,ft._jsonSchema))return new ft(e.latitude,e.longitude)}}ft._jsonSchemaVersion="firestore/geoPoint/1.0",ft._jsonSchema={type:he("string",ft._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ve.UNAUTHENTICATED=new Ve(null),Ve.GOOGLE_CREDENTIALS=new Ve("google-credentials-uid"),Ve.FIRST_PARTY=new Ve("first-party-uid"),Ve.MOCK_USER=new Ve("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vd{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class nE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ve.UNAUTHENTICATED)))}shutdown(){}}class rE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class sE{constructor(e){this.De=e,this.currentUser=Ve.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){F(this.Ce===void 0,42304);let r=this.xe;const s=l=>this.xe!==r?(r=this.xe,t(l)):Promise.resolve();let i=new Ht;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),i.resolve(),i=new Ht,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const l=i;e.enqueueRetryable((()=>_(this,null,function*(){yield l.promise,yield s(this.currentUser)})))},c=l=>{O("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),a())};this.De.onInit((l=>c(l))),setTimeout((()=>{if(!this.auth){const l=this.De.getImmediate({optional:!0});l?c(l):(O("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ht)}}),0),a()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.xe!==e?(O("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(F(typeof r.accessToken=="string",31837,{Oe:r}),new vd(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return F(e===null||typeof e=="string",2055,{Me:e}),new Ve(e)}}class iE{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r,this.type="FirstParty",this.user=Ve.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class oE{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r}getToken(){return Promise.resolve(new iE(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable((()=>t(Ve.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class ul{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class aE{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Fe(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){F(this.Ce===void 0,3512);const r=i=>{i.error!=null&&O("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.$e;return this.$e=i.token,O("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.Ce=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{O("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.qe.getImmediate({optional:!0});i?s(i):O("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.Ke)return Promise.resolve(new ul(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(F(typeof t.token=="string",44558,{tokenResult:t}),this.$e=t.token,new ul(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function Ad(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cE{Qe(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ll="ConnectivityMonitor";class hl{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){O(ll,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){O(ll,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return typeof window!="undefined"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ws=null;function ea(){return Ws===null?Ws=(function(){return 268435456+Math.round(2147483648*Math.random())})():Ws++,"0x"+Ws.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xo="RestConnection",uE={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class lE{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${r}/databases/${s}`,this.tt=this.databaseId.database===Wo?`project_id=${r}`:`project_id=${r}&database_id=${s}`}nt(e,t,r,s,i){const a=ea(),c=this.rt(e,t.toUriEncodedString());O(xo,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(l,s,i);const{host:d}=new URL(c),p=tr(d);return this.st(e,c,l,r,p).then((m=>(O(xo,`Received RPC '${e}' ${a}: `,m),m)),(m=>{throw st(xo,`RPC '${e}' ${a} failed with error: `,m,"url: ",c,"request:",r),m}))}_t(e,t,r,s,i,a){return this.nt(e,t,r,s,i)}it(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+sr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}rt(e,t){const r=uE[e];let s=`${this.Xe}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hE{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="WebChannelConnection",Cr=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class jn extends lE{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!jn.yt){const e=Dh();Cr(e,kh.STAT_EVENT,(t=>{t.stat===zo.PROXY?O(Se,"STAT_EVENT: detected buffering proxy"):t.stat===zo.NOPROXY&&O(Se,"STAT_EVENT: detected no buffering proxy")})),jn.yt=!0}}st(e,t,r,s,i){const a=ea();return new Promise(((c,l)=>{const d=new bh;d.setWithCredentials(!0),d.listenOnce(Nh.COMPLETE,(()=>{try{switch(d.getLastErrorCode()){case Zs.NO_ERROR:const m=d.getResponseJson();O(Se,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(m)),c(m);break;case Zs.TIMEOUT:O(Se,`RPC '${e}' ${a} timed out`),l(new L(N.DEADLINE_EXCEEDED,"Request time out"));break;case Zs.HTTP_ERROR:const w=d.getStatus();if(O(Se,`RPC '${e}' ${a} failed with status:`,w,"response text:",d.getResponseText()),w>0){let V=d.getResponseJson();Array.isArray(V)&&(V=V[0]);const k=V==null?void 0:V.error;if(k&&k.status&&k.message){const U=(function(K){const Z=K.toLowerCase().replace(/_/g,"-");return Object.values(N).indexOf(Z)>=0?Z:N.UNKNOWN})(k.status);l(new L(U,k.message))}else l(new L(N.UNKNOWN,"Server responded with status "+d.getStatus()))}else l(new L(N.UNAVAILABLE,"Connection failed."));break;default:$(9055,{wt:e,streamId:a,bt:d.getLastErrorCode(),St:d.getLastError()})}}finally{O(Se,`RPC '${e}' ${a} completed.`)}}));const p=JSON.stringify(s);O(Se,`RPC '${e}' ${a} sending request:`,s),d.send(t,"POST",p,r,15)}))}vt(e,t,r){const s=ea(),i=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.it(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const d=i.join("");O(Se,`Creating RPC '${e}' stream ${s}: ${d}`,c);const p=a.createWebChannel(d,c);this.Dt(p);let m=!1,w=!1;const V=new hE({ot:k=>{w?O(Se,`Not sending because RPC '${e}' stream ${s} is closed:`,k):(m||(O(Se,`Opening RPC '${e}' stream ${s} transport.`),p.open(),m=!0),O(Se,`RPC '${e}' stream ${s} sending:`,k),p.send(k))},ut:()=>p.close()});return Cr(p,kr.EventType.OPEN,(()=>{w||(O(Se,`RPC '${e}' stream ${s} transport opened.`),V.Rt())})),Cr(p,kr.EventType.CLOSE,(()=>{w||(w=!0,O(Se,`RPC '${e}' stream ${s} transport closed`),V.Vt(),this.xt(p))})),Cr(p,kr.EventType.ERROR,(k=>{w||(w=!0,st(Se,`RPC '${e}' stream ${s} transport errored. Name:`,k.name,"Message:",k.message),V.Vt(new L(N.UNAVAILABLE,"The operation could not be completed")))})),Cr(p,kr.EventType.MESSAGE,(k=>{var U;if(!w){const M=k.data[0];F(!!M,16349);const K=M,Z=(K==null?void 0:K.error)||((U=K[0])==null?void 0:U.error);if(Z){O(Se,`RPC '${e}' stream ${s} received error:`,Z);const re=Z.status;let ke=(function(v){const g=le[v];if(g!==void 0)return cd(g)})(re),ge=Z.message;re==="NOT_FOUND"&&ge.includes("database")&&ge.includes("does not exist")&&ge.includes(this.databaseId.database)&&st(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),ke===void 0&&(ke=N.INTERNAL,ge="Unknown error status: "+re+" with message "+Z.message),w=!0,V.Vt(new L(ke,ge)),p.close()}else O(Se,`RPC '${e}' stream ${s} received:`,M),V.dt(M)}})),jn.gt(),setTimeout((()=>{V.At()}),0),V}terminate(){this.ft.forEach((e=>e.close())),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter((t=>t===e))}it(e,t,r){super.it(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return xh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dE(n){return new jn(n)}jn.yt=!1;class Rd{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Ct=e,this.timerId=t,this.Ft=r,this.Ot=s,this.Mt=i,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),r=Math.max(0,Date.now()-this.Bt),s=Math.max(0,t-r);s>0&&O("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,s,(()=>(this.Bt=Date.now(),e()))),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){this.Lt!==null&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){this.Lt!==null&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dl="PersistentStream";class Pd{constructor(e,t,r,s,i,a,c,l){this.Ct=e,this.Kt=r,this.Qt=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new Rd(e,t)}Jt(){return this.state===1||this.state===5||this.Yt()}Yt(){return this.state===2||this.state===3}start(){this.jt=0,this.state!==4?this.auth():this.Zt()}stop(){return _(this,null,function*(){this.Jt()&&(yield this.close(0))})}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&this.Gt===null&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,(()=>this.tn())))}nn(e){this.rn(),this.stream.send(e)}tn(){return _(this,null,function*(){if(this.Yt())return this.close(0)})}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}close(e,t){return _(this,null,function*(){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,e!==4?this.Ht.reset():t&&t.code===N.RESOURCE_EXHAUSTED?(Pt(t.toString()),Pt("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===N.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this._n(),this.stream.close(),this.stream=null),this.state=e,yield this.listener.Tt(t)})}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.Wt===t&&this.un(r,s)}),(r=>{e((()=>{const s=new L(N.UNKNOWN,"Fetching auth token failed: "+r.message);return this.cn(s)}))}))}un(e,t){const r=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct((()=>{r((()=>this.listener.ct()))})),this.stream.Et((()=>{r((()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,(()=>(this.Yt()&&(this.state=3),Promise.resolve()))),this.listener.Et())))})),this.stream.Tt((s=>{r((()=>this.cn(s)))})),this.stream.onMessage((s=>{r((()=>++this.jt==1?this.hn(s):this.onNext(s)))}))}Zt(){this.state=5,this.Ht.kt((()=>_(this,null,function*(){this.state=0,this.start()})))}cn(e){return O(dl,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget((()=>this.Wt===e?t():(O(dl,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class fE extends Pd{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=jy(this.serializer,e),r=(function(i){if(!("targetChange"in i))return z.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?z.min():a.readTime?dt(a.readTime):z.min()})(e);return this.listener.Tn(t,r)}Pn(e){const t={};t.database=Zo(this.serializer),t.addTarget=(function(i,a){let c;const l=a.target;if(c=yn(l)?{pipelineQuery:Yy(i,l)}:ad(l)?{documents:Wy(i,l)}:{query:Gy(i,l).Se},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=pd(i,a.resumeToken);const d=Jo(i,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo(z.min())>0){c.readTime=jr(i,a.snapshotVersion.toTimestamp());const d=Jo(i,a.expectedCount);d!==null&&(c.expectedCount=d)}return c})(this.serializer,e);const r=Qy(this.serializer,e);r&&(t.labels=r),this.nn(t)}In(e){const t={};t.database=Zo(this.serializer),t.removeTarget=e,this.nn(t)}}class pE extends Pd{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return F(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,F(!e.writeResults||e.writeResults.length===0,55816),this.listener.Vn()}onNext(e){F(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=Hy(e.writeResults,e.commitTime),r=dt(e.commitTime);return this.listener.dn(r,t)}fn(){const e={};e.database=Zo(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>zy(this.serializer,r)))};this.nn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mE{}class gE extends mE{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.mn=!1}pn(){if(this.mn)throw new L(N.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.nt(e,Xo(t,r),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new L(N.UNKNOWN,i.toString())}))}_t(e,t,r,s,i){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,c])=>this.connection._t(e,Xo(t,r),s,a,c,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new L(N.UNKNOWN,a.toString())}))}terminate(){this.mn=!0,this.connection.terminate()}}function _E(n,e,t,r){return new gE(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yE="ComponentProvider",fl=new Map;function EE(n,e,t,r,s){return new Y_(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Ad(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Sd=41943040;class Me{static withCacheSize(e){return new Me(e,Me.DEFAULT_COLLECTION_PERCENTILE,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Me.DEFAULT_COLLECTION_PERCENTILE=10,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Me.DEFAULT=new Me(Sd,Me.DEFAULT_COLLECTION_PERCENTILE,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Me.DISABLED=new Me(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zi{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.gn(r),this.yn=r=>t.writeSequenceNumber(r))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}zi.wn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class wE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ir(n){return _(this,null,function*(){if(n.code!==N.FAILED_PRECONDITION||n.message!==TE)throw n;O("LocalStore","Unexpectedly lost primary lease")})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&$(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new b(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof b?t:b.resolve(t)}catch(t){return b.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):b.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):b.reject(t)}static resolve(e){return new b(((t,r)=>{t(e)}))}static reject(e){return new b(((t,r)=>{r(e)}))}static waitFor(e){return new b(((t,r)=>{let s=0,i=0,a=!1;e.forEach((c=>{++s,c.next((()=>{++i,a&&i===s&&t()}),(l=>r(l)))})),a=!0,i===s&&t()}))}static or(e){let t=b.resolve(!1);for(const r of e)t=t.next((s=>s?b.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new b(((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let l=0;l<i;l++){const d=l;t(e[d]).next((p=>{a[d]=p,++c,c===i&&r(a)}),(p=>s(p)))}}))}static doWhile(e,t){return new b(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}function IE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function or(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ml="LruGarbageCollector",Vd=1048576;function gl([n,e],[t,r]){const s=Y(n,t);return s===0?Y(e,r):s}class vE{constructor(e){this.Yn=e,this.buffer=new de(gl),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();gl(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class AE{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.tr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return this.tr!==null}nr(e){O(ml,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(()=>_(this,null,function*(){this.tr=null;try{yield this.localStore.collectGarbage(this.garbageCollector)}catch(t){or(t)?O(ml,"Ignoring IndexedDB error during garbage collection: ",t):yield ir(t)}yield this.nr(3e5)})))}}class RE{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return b.resolve(zi.wn);const r=new vE(t);return this.rr.forEachTarget(e,(s=>r.er(s.sequenceNumber))).next((()=>this.rr.sr(e,(s=>r.er(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.rr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(O("LruGarbageCollector","Garbage collection skipped; disabled"),b.resolve(pl)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(O("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),pl):this._r(e,t)))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let r,s,i,a,c,l,d;const p=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((m=>(m>this.params.maximumSequenceNumbersToCollect?(O("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,a=Date.now(),this.nthSequenceNumber(e,s)))).next((m=>(r=m,c=Date.now(),this.removeTargets(e,r,t)))).next((m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,r)))).next((m=>(d=Date.now(),On()<=J.DEBUG&&O("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${m} documents in `+(d-l)+`ms
Total Duration: ${d-p}ms`),b.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m}))))}}function PE(n,e){return new RE(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cd="firestore.googleapis.com",_l=!0;class yl{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new L(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Cd,this.ssl=_l}else this.host=e.host,this.ssl=(t=e.ssl)!=null?t:_l;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders=G({},e._customHeaders)),e.cacheSizeBytes===void 0)this.cacheSizeBytes=Sd;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Vd)throw new L(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(K_("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ad((r=e.experimentalLongPollingOptions)!=null?r:{}),(function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new L(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new L(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new L(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new L(N.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),a=Object.keys(s);if(i.length!==a.length)return!1;for(const c of i)if(r[c]!==s[c])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Hi=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new yl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new L(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new L(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new yl(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new nE;switch(r.type){case"firstParty":return new oE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new L(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}_restart(){return _(this,null,function*(){this._terminateTask==="notTerminated"?yield this._terminate():this._terminateTask="notTerminated"})}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=fl.get(t);r&&(O(yE,"Removing Datastore"),fl.delete(t),r.terminate())})(this),Promise.resolve()}};function SE(n,e,t,r={}){var d;n=Ye(n,Hi);const s=tr(e),i=n._getSettings(),a=ue(G({},i),{emulatorOptions:n._getEmulatorOptions()}),c=`${e}:${t}`;s&&la(`https://${c}`),i.host!==Cd&&i.host!==c&&st("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l=ue(G({},i),{host:c,ssl:s,emulatorOptions:r});if(!Qt(l,a)&&(n._setSettings(l),r.mockUserToken)){let p,m;if(typeof r.mockUserToken=="string")p=r.mockUserToken,m=Ve.MOCK_USER;else{p=Ip(r.mockUserToken,(d=n._app)==null?void 0:d.options.projectId);const w=r.mockUserToken.sub||r.mockUserToken.user_id;if(!w)throw new L(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new Ve(w)}n._authCredentials=new rE(new vd(p,m))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Wi(this.firestore,e,this._query)}}class ae{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Wt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ae(this.firestore,e,this._key)}toJSON(){return{type:ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(gs(t,ae._jsonSchema))return new ae(e,r||null,new B(ee.fromString(t.referencePath)))}}ae._jsonSchemaVersion="firestore/documentReference/1.0",ae._jsonSchema={type:he("string",ae._jsonSchemaVersion),referencePath:he("string")};class Wt extends Wi{constructor(e,t,r){super(e,t,Bi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ae(this.firestore,null,new B(e))}withConverter(e){return new Wt(this.firestore,e,this._path)}}function XI(n,e,...t){if(n=fe(n),Mh("collection","path",e),n instanceof Hi){const r=ee.fromString(e,...t);return Hu(r),new Wt(n,null,r)}{if(!(n instanceof ae||n instanceof Wt))throw new L(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return Hu(r),new Wt(n.firestore,null,r)}}function VE(n,e,...t){if(n=fe(n),arguments.length===1&&(e=Ia.newId()),Mh("doc","path",e),n instanceof Hi){const r=ee.fromString(e,...t);return zu(r),new ae(n,null,new B(r))}{if(!(n instanceof ae||n instanceof Wt))throw new L(N.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return zu(r),new ae(n.firestore,n instanceof Wt?n.converter:null,new B(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $e{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:$e._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(gs(e,$e._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new $e(e.vectorValues);throw new L(N.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}$e._jsonSchemaVersion="firestore/vectorValue/1.0",$e._jsonSchema={type:he("string",$e._jsonSchemaVersion),vectorValues:he("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CE=/^__.*__$/;class bE{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new un(e,this.data,this.fieldMask,t,this.fieldTransforms):new ys(e,this.data,t,this.fieldTransforms)}}class bd{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new un(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Nd(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw $(40011,{dataSource:n})}}class Da{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Da(G(G({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ii(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(Nd(this.dataSource)&&CE.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class NE{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||qi(e)}createContext(e,t,r,s=!1){return new Da({dataSource:e,methodName:t,targetDoc:r,path:Qe.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function xa(n){const e=n._freezeSettings(),t=qi(n._databaseId);return new NE(n._databaseId,!!e.ignoreUndefinedProperties,t)}function kd(n,e,t,r,s,i={}){const a=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);Oa("Data must be an object, but it was:",a,r);const c=Dd(r,a);let l,d;if(i.merge)l=new Ge(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const p=[];for(const m of i.mergeFields){const w=Zn(e,m,t);if(!a.contains(w))throw new L(N.INVALID_ARGUMENT,`Field '${w}' is specified in your field mask but missing from your input data.`);Md(p,w)||p.push(w)}l=new Ge(p),d=a.fieldTransforms.filter((m=>l.covers(m.field)))}else l=null,d=a.fieldTransforms;return new bE(new Oe(c),l,d)}class Gi extends ka{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Gi}}function kE(n,e,t,r){const s=n.createContext(1,e,t);Oa("Data must be an object, but it was:",s,r);const i=[],a=Oe.empty();cn(r,((l,d)=>{const p=Ld(e,l,t);d=fe(d);const m=s.childContextForFieldPath(p);if(d instanceof Gi)i.push(p);else{const w=Vn(d,m);w!=null&&(i.push(p),a.set(p,w))}}));const c=new Ge(i);return new bd(a,c,s.fieldTransforms)}function DE(n,e,t,r,s,i){const a=n.createContext(1,e,t),c=[Zn(e,r,t)],l=[s];if(i.length%2!=0)throw new L(N.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let w=0;w<i.length;w+=2)c.push(Zn(e,i[w])),l.push(i[w+1]);const d=[],p=Oe.empty();for(let w=c.length-1;w>=0;--w)if(!Md(d,c[w])){const V=c[w];let k=l[w];k=fe(k);const U=a.childContextForFieldPath(V);if(k instanceof Gi)d.push(V);else{const M=Vn(k,U);M!=null&&(d.push(V),p.set(V,M))}}const m=new Ge(d);return new bd(p,m,a.fieldTransforms)}function Vn(n,e,t){if(Od(n=fe(n)))return Oa("Unsupported field value:",e,n),Dd(n,e);if(n instanceof ka)return(function(s,i){if(!Nd(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let c=0;for(const l of s){let d=Vn(l,i.childContextForArray(c));d==null&&(d={nullValue:"NULL_VALUE"}),a.push(d),c++}return{arrayValue:{values:a}}})(n,e)}return(function(s,i,a){if((s=fe(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Pa(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=te.fromDate(s);return{timestampValue:jr(i.serializer,c)}}if(s instanceof te){const c=new te(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:jr(i.serializer,c)}}if(xd(s)){const c=te.fromInstant(s),l=new te(c.seconds,1e3*Math.floor(c.nanoseconds/1e3));return{timestampValue:jr(i.serializer,l)}}if(s instanceof ft)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Xe)return{bytesValue:pd(i.serializer,s._byteString)};if(s instanceof ae){const c=i.databaseId,l=s.firestore._databaseId;if(!l.isEqual(c))throw i.createError(`Document reference is for database ${l.projectId}/${l.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:Na(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof $e)return(function(l,d){const p=l instanceof $e?l.toArray():l;return{mapValue:{fields:{[jh]:{stringValue:zh},[Yr]:{arrayValue:{values:p.map((w=>{if(typeof w!="number")throw d.createError("VectorValues must only contain numeric values.");return Li(d.serializer,w)}))}}}}}})(s,i);if(wd(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${va(s)}`)})(n,e)}function Dd(n,e){const t={};return Lh(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):cn(n,((r,s)=>{const i=Vn(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function xd(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal!="undefined"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.t=="bigint"}function Od(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof te||n instanceof ft||n instanceof Xe||n instanceof ae||n instanceof ka||n instanceof $e||xd(n)||wd(n))}function Oa(n,e,t){if(!Od(t)||!ms(t)){const r=va(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Zn(n,e,t){if((e=fe(e))instanceof ji)return e._internalPath;if(typeof e=="string")return Ld(n,e);throw Ii("Field path arguments must be of type string or ",n,!1,void 0,t)}const xE=new RegExp("[~\\*/\\[\\]]");function Ld(n,e,t){if(e.search(xE)>=0)throw Ii(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ji(...e.split("."))._internalPath}catch(r){throw Ii(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ii(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${r}`),a&&(l+=` in document ${s}`),l+=")"),new L(N.INVALID_ARGUMENT,c+n+l)}function Md(n,e){return n.some((t=>t.isEqual(e)))}function OE(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){var s;const r=Oe.empty();for(const i in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(i)){const a=this.optionDefinitions[i];if(i in e){const c=e[i];let l;a.nestedOptions&&ms(c)?l={mapValue:{fields:new Ne(a.nestedOptions).getOptionsProto(t,c)}}:c&&(l=(s=Vn(c,t))!=null?s:void 0),l&&r.set(Qe.fromServerFormat(a.serverName),l)}}return r}getOptionsProto(e,t,r){var i;const s=this._getKnownOptions(t,e);if(r){const a=new Map(G_(r,((c,l)=>[Qe.fromServerFormat(l),c!==void 0?Vn(c,e):null])));s.setAll(a)}return(i=s.value.mapValue.fields)!=null?i:{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LE(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!ms(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function ME(n){return new $e(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(n){let e;return n instanceof bn?n:(e=ms(n)?jE(n):n instanceof Array?zE(n):Ud(n,void 0),e)}function Oo(n){if(n instanceof bn)return n;if(n instanceof $e)return rs(n);if(Array.isArray(n))return rs(ME(n));throw new Error("Unsupported value: "+typeof n)}function La(n){return Z_(n)?BE(n):D(n)}class bn{constructor(){this._protoValueType="ProtoValue"}add(e){return new C("add",[this,D(e)],"add")}asBoolean(){if(this instanceof tn)return this;if(this instanceof ar)return new Bd(this);if(this instanceof ws)return new qE(this);if(this instanceof C)return new Fd(this);throw new L("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new C("subtract",[this,D(e)],"subtract")}multiply(e){return new C("multiply",[this,D(e)],"multiply")}divide(e){return new C("divide",[this,D(e)],"divide")}mod(e){return new C("mod",[this,D(e)],"mod")}equal(e){return new C("equal",[this,D(e)],"equal").asBoolean()}notEqual(e){return new C("not_equal",[this,D(e)],"notEqual").asBoolean()}lessThan(e){return new C("less_than",[this,D(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new C("less_than_or_equal",[this,D(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new C("greater_than",[this,D(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new C("greater_than_or_equal",[this,D(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>D(s)));return new C("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new C("array_contains",[this,D(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new xr(e.map(D),"arrayContainsAll"):e;return new C("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new xr(e.map(D),"arrayContainsAny"):e;return new C("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new C("array_reverse",[this])}arrayLength(){return new C("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new xr(e.map(D),"equalAny"):e;return new C("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new xr(e.map(D),"notEqualAny"):e;return new C("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new C("exists",[this],"exists").asBoolean()}charLength(){return new C("char_length",[this],"charLength")}like(e){return new C("like",[this,D(e)],"like").asBoolean()}regexContains(e){return new C("regex_contains",[this,D(e)],"regexContains").asBoolean()}regexFind(e){return new C("regex_find",[this,D(e)],"regexFind")}regexFindAll(e){return new C("regex_find_all",[this,D(e)],"regexFindAll")}regexMatch(e){return new C("regex_match",[this,D(e)],"regexMatch").asBoolean()}stringContains(e){return new C("string_contains",[this,D(e)],"stringContains").asBoolean()}startsWith(e){return new C("starts_with",[this,D(e)],"startsWith").asBoolean()}endsWith(e){return new C("ends_with",[this,D(e)],"endsWith").asBoolean()}toLower(){return new C("to_lower",[this],"toLower")}toUpper(){return new C("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(D(e)),new C("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(D(e)),new C("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(D(e)),new C("rtrim",t,"rtrim")}type(){return new C("type",[this])}isType(e){return new C("is_type",[this,rs(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(D);return new C("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new C("string_index_of",[this,D(e)],"stringIndexOf")}stringRepeat(e){return new C("string_repeat",[this,D(e)],"stringRepeat")}stringReplaceAll(e,t){return new C("string_replace_all",[this,D(e),D(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new C("string_replace_one",[this,D(e),D(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(D);return new C("concat",[this,...r],"concat")}reverse(){return new C("reverse",[this],"reverse")}arrayFilter(e,t){return new C("array_filter",[this,D(e),t],"arrayFilter")}arrayTransform(e,t){return new C("array_transform",[this,D(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new C("array_transform",[this,D(e),D(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,D(e)];return t!==void 0&&r.push(D(t)),new C("array_slice",r,"arraySlice")}arrayFirst(){return new C("array_first",[this],"arrayFirst")}arrayFirstN(e){return new C("array_first_n",[this,D(e)],"arrayFirstN")}arrayLast(){return new C("array_last",[this],"arrayLast")}arrayLastN(e){return new C("array_last_n",[this,D(e)],"arrayLastN")}arrayMaximum(){return new C("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new C("maximum_n",[this,D(e)],"arrayMaximumN")}arrayMinimum(){return new C("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new C("minimum_n",[this,D(e)],"arrayMinimumN")}arrayIndexOf(e){return new C("array_index_of",[this,D(e),D("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new C("array_index_of",[this,D(e),D("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new C("array_index_of_all",[this,D(e)],"arrayIndexOfAll")}byteLength(){return new C("byte_length",[this],"byteLength")}ceil(){return new C("ceil",[this])}floor(){return new C("floor",[this])}abs(){return new C("abs",[this])}exp(){return new C("exp",[this])}mapGet(e){return new C("map_get",[this,rs(e)],"mapGet")}mapSet(e,t,...r){const s=[this,D(e),D(t),...r.map(D)];return new C("map_set",s,"mapSet")}mapKeys(){return new C("map_keys",[this],"mapKeys")}mapValues(){return new C("map_values",[this],"mapValues")}mapEntries(){return new C("map_entries",[this],"mapEntries")}getField(e){return new C("get_field",[this,D(e)],"get_field")}count(){return We._create("count",[this],"count")}sum(){return We._create("sum",[this],"sum")}average(){return We._create("average",[this],"average")}minimum(){return We._create("minimum",[this],"minimum")}maximum(){return We._create("maximum",[this],"maximum")}first(){return We._create("first",[this],"first")}last(){return We._create("last",[this],"last")}arrayAgg(){return We._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return We._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return We._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new C("maximum",[this,...r.map(D)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new C("minimum",[this,...r.map(D)],"minimum")}vectorLength(){return new C("vector_length",[this],"vectorLength")}cosineDistance(e){return new C("cosine_distance",[this,Oo(e)],"cosineDistance")}dotProduct(e){return new C("dot_product",[this,Oo(e)],"dotProduct")}euclideanDistance(e){return new C("euclidean_distance",[this,Oo(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new C("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new C("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new C("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new C("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new C("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new C("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new C("timestamp_add",[this,D(e),D(t)],"timestampAdd")}timestampSubtract(e,t){return new C("timestamp_subtract",[this,D(e),D(t)],"timestampSubtract")}timestampDiff(e,t){return new C("timestamp_diff",[this,La(e),D(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_extract",r,"timestampExtract")}documentId(){return new C("document_id",[this],"documentId")}parent(){return new C("parent",[this],"parent")}substring(e,t){const r=D(e);return new C("substring",t===void 0?[this,r]:[this,r,D(t)],"substring")}arrayGet(e){return new C("array_get",[this,D(e)],"arrayGet")}isError(){return new C("is_error",[this],"isError").asBoolean()}ifError(e){const t=new C("if_error",[this,D(e)],"ifError");return e instanceof tn?t.asBoolean():t}isAbsent(){return new C("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new C("map_remove",[this,D(e)],"mapRemove")}mapMerge(e,...t){const r=D(e),s=t.map(D);return new C("map_merge",[this,r,...s],"mapMerge")}pow(e){return new C("pow",[this,D(e)])}trunc(e){return e===void 0?new C("trunc",[this]):new C("trunc",[this,D(e)],"trunc")}round(e){return e===void 0?new C("round",[this]):new C("round",[this,D(e)],"round")}collectionId(){return new C("collection_id",[this])}length(){return new C("length",[this])}ln(){return new C("ln",[this])}sqrt(){return new C("sqrt",[this])}stringReverse(){return new C("string_reverse",[this])}ifAbsent(e){return new C("if_absent",[this,D(e)],"ifAbsent")}ifNull(e){return new C("if_null",[this,D(e)],"ifNull")}coalesce(e,...t){return new C("coalesce",[this,D(e),...t.map(D)],"coalesce")}join(e){return new C("join",[this,D(e)],"join")}log10(){return new C("log10",[this])}arraySum(){return new C("sum",[this])}split(e){return new C("split",[this,D(e)])}timestampTruncate(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_trunc",r)}ascending(){return HE(this)}descending(){return WE(this)}as(e){return new FE(this,e,"as")}}class We{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new We(e,t);return s._methodName=r,s}as(e){return new UE(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class UE{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class FE{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class xr extends bn{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map((t=>t._toProto(e)))}}}_readUserData(e){this.cr.forEach((t=>t._readUserData(e)))}}class ws extends bn{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new C("geo_distance",[this,D(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function BE(n){return $E(n,"field")}function $E(n,e){return new ws(typeof n=="string"?Kn===n?tE()._internalPath:Zn("field",n):n._internalPath,e)}class ar extends bn{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new ar(e,void 0);return t._protoValue=e,t}_toProto(e){return F(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,LE(this._protoValue)||(this._protoValue=Vn(this.value,e))}}function rs(n,e){return Ud(n,"constant")}function Ud(n,e){const t=new ar(n,e);return typeof n=="boolean"?new Bd(t):t}class C extends bn{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Ne({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class tn extends bn{get _methodName(){return this._expr._methodName}countIf(){return We._create("count_if",[this],"countIf")}not(){return new C("not",[this],"not").asBoolean()}conditional(e,t){return new C("conditional",[this,e,t],"conditional")}ifError(e){const t=D(e),r=new C("if_error",[this,t],"ifError");return t instanceof tn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Fd extends tn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Bd extends tn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class qE extends tn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function jE(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(rs(r)),t.push(D(s))}return new C("map",t,"map")}function zE(n){return(function(t,r){return new C("array",t.map((s=>D(s))),r)})(n,"array")}function HE(n){return new $d(La(n),"ascending","ascending")}function WE(n){return new $d(La(n),"descending","descending")}class $d{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Id(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e){var t,r;this.optionsProto=void 0,r=t=e,{rawOptions:this.rawOptions}=r,this.knownOptions=Sr(r,["rawOptions"])}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class qd extends Je{get _name(){return"add_fields"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[ns(e,this.fields)]})}_readUserData(e){super._readUserData(e),nn(this.fields,e)}}class jd extends Je{get _name(){return"aggregate"}get _optionsUtil(){return new Ne({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return ue(G({},super._toProto(e)),{args:[ns(e,this.accumulators),ns(e,this.groups)]})}_readUserData(e){super._readUserData(e),nn(this.groups,e),nn(this.accumulators,e)}}class zd extends Je{get _name(){return"distinct"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[ns(e,this.groups)]})}_readUserData(e){super._readUserData(e),nn(this.groups,e)}}class Ki extends Je{get _name(){return"collection"}get _optionsUtil(){return new Ne({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return ue(G({},super._toProto(e)),{args:[{referenceValue:this.hr}]})}_readUserData(e){super._readUserData(e)}}class Qi extends Je{get _name(){return"collection_group"}get _optionsUtil(){return new Ne({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[{referenceValue:""},{stringValue:this.collectionId}]})}_readUserData(e){super._readUserData(e)}}class Ma extends Je{get _name(){return"database"}get _optionsUtil(){return new Ne({})}_toProto(e){return G({},super._toProto(e))}_readUserData(e){super._readUserData(e)}}class Ua extends Je{get _name(){return"documents"}get _optionsUtil(){return new Ne({})}constructor(e,t){if(super(t),!e||e.length===0)throw new L(N.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new L(N.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=r,this.Pr=s}_toProto(e){return ue(G({},super._toProto(e)),{args:this.Tr.map((t=>({referenceValue:t})))})}_readUserData(e){super._readUserData(e)}}class Fa extends Je{get _name(){return"where"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[this.condition._toProto(e)]})}_readUserData(e){super._readUserData(e),nn(this.condition,e)}}class ss extends Je{get _name(){return"limit"}get _optionsUtil(){return new Ne({})}constructor(e,t){F(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[Pa(e,this.limit)]})}}class El extends Je{get _name(){return"offset"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[Pa(e,this.offset)]})}}class GE extends Je{get _name(){return"select"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[ns(e,this.selections)]})}_readUserData(e){super._readUserData(e),nn(this.selections,e)}}class Ba extends Je{get _name(){return"sort"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return ue(G({},super._toProto(e)),{args:this.orderings.map((t=>t._toProto(e)))})}_readUserData(e){super._readUserData(e),nn(this.orderings,e)}}class $a extends Je{get _name(){return"replace_with"}get _optionsUtil(){return new Ne({})}constructor(e,t){super(t),this.map=e}_toProto(e){return ue(G({},super._toProto(e)),{args:[this.map._toProto(e),Id($a.Ir)]})}_readUserData(e){super._readUserData(e),nn(this.map,e)}}$a.Ir="full_replace";function nn(n,e){return OE(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}// Copyright 2024 Google LLC* @license
class Ue{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return Yi(this)}getPipelineCollectionGroup(){return qa(this)}getPipelineCollectionId(){return KE(this)}getPipelineDocuments(){return ta(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==zd.name&&s._name!==jd.name||(r="keyless"),s._name===GE.name&&r==="exact"&&(r="augmented"),s._name===qd.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return Gt(this)}}function Gt(n){const e=n.stages[0];return e instanceof Ki||e instanceof Qi||e instanceof Ma||e instanceof Ua?e._name:"unknown"}function Yi(n){if(Gt(n)==="collection")return n.stages[0].hr}function qa(n){if(Gt(n)==="collection_group")return n.stages[0].collectionId}function KE(n){switch(Gt(n)){case"collection":return ee.fromString(Yi(n)).lastSegment();case"collection_group":return qa(n);default:return}}function ta(n){if(Gt(n)==="documents")return n.stages[0].Tr}class T{constructor(e,t){this.type=e,this.value=t}static mr(){return new T("ERROR",void 0)}static pr(){return new T("UNSET",void 0)}static gr(){return new T("NULL",Yn)}static newValue(e){return Ke(e)?new T("NULL",Yn):(function(r){return!!r&&"booleanValue"in r})(e)?new T("BOOLEAN",e):ct(e)?new T("INT",e):Tn(e)?new T("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new T("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new T("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new T("BYTES",e):e.referenceValue?new T("REFERENCE",e):e.geoPointValue?new T("GEO_POINT",e):Xn(e)?new T("ARRAY",e):pi(e)?new T("VECTOR",e):In(e)?new T("MAP",e):new T("ERROR",void 0)}yr(){return this.type==="ERROR"||this.type==="UNSET"}wr(){return this.type==="NULL"}}function zr(n){if(!n.yr())return n.value}function Hd(n){return n instanceof tn?n._expr:n}function q(n){if((n=Hd(n))instanceof ws)return new QE(n);if(n instanceof ar)return new YE(n);if(n instanceof xr)return new JE(n);if(n instanceof C){if(n.name==="add")return new eT(n);if(n.name==="subtract")return new tT(n);if(n.name==="multiply")return new nT(n);if(n.name==="divide")return new rT(n);if(n.name==="mod")return new sT(n);if(n.name==="and")return new iT(n);if(n.name==="equal")return new _T(n);if(n.name==="not_equal")return new yT(n);if(n.name==="less_than")return new ET(n);if(n.name==="less_than_or_equal")return new TT(n);if(n.name==="greater_than")return new wT(n);if(n.name==="greater_than_or_equal")return new IT(n);if(n.name==="array_concat")return new vT(n);if(n.name==="array_reverse")return new AT(n);if(n.name==="array_contains")return new RT(n);if(n.name==="array_contains_all")return new PT(n);if(n.name==="array_contains_any")return new ST(n);if(n.name==="array_length")return new VT(n);if(n.name==="array_element")return new CT(n);if(n.name==="equal_any")return new Wd(n);if(n.name==="not_equal_any")return new aT(n);if(n.name==="is_nan")return new cT(n);if(n.name==="is_not_nan")return new uT(n);if(n.name==="is_null")return new lT(n);if(n.name==="is_not_null")return new hT(n);if(n.name==="is_error")return new dT(n);if(n.name==="exists")return new fT(n);if(n.name==="not")return new Ji(n);if(n.name==="or")return new oT(n);if(n.name==="xor")return new ja(n);if(n.name==="conditional")return new pT(n);if(n.name==="maximum")return new mT(n);if(n.name==="minimum")return new gT(n);if(n.name==="reverse")return new bT(n);if(n.name==="replace_first")return new NT(n);if(n.name==="replace_all")return new kT(n);if(n.name==="char_length")return new DT(n);if(n.name==="byte_length")return new xT(n);if(n.name==="like")return new OT(n);if(n.name==="regex_contains")return new LT(n);if(n.name==="regex_match")return new MT(n);if(n.name==="string_contains")return new UT(n);if(n.name==="starts_with")return new FT(n);if(n.name==="ends_with")return new BT(n);if(n.name==="to_lower")return new $T(n);if(n.name==="to_upper")return new qT(n);if(n.name==="trim")return new jT(n);if(n.name==="string_concat")return new zT(n);if(n.name==="map_get")return new HT(n);if(n.name==="cosine_distance")return new WT(n);if(n.name==="dot_product")return new GT(n);if(n.name==="euclidean_distance")return new KT(n);if(n.name==="vector_length")return new QT(n);if(n.name==="unix_micros_to_timestamp")return new ew(n);if(n.name==="timestamp_to_unix_micros")return new rw(n);if(n.name==="unix_millis_to_timestamp")return new tw(n);if(n.name==="timestamp_to_unix_millis")return new sw(n);if(n.name==="unix_seconds_to_timestamp")return new nw(n);if(n.name==="timestamp_to_unix_seconds")return new iw(n);if(n.name==="timestamp_add")return new ow(n);if(n.name==="timestamp_subtract")return new aw(n)}throw new Error(`Unknown Expr : ${n}`)}class QE{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Kn)return T.newValue({referenceValue:wi(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return T.newValue({timestampValue:ri(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return T.newValue({timestampValue:ri(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?xi(r)?T.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:ri(i.serializer,z.fromTimestamp(Qn(a)))};if(i.serverTimestampBehavior==="previous"){const c=_s(a);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):T.newValue(r):T.pr()}}class YE{constructor(e){this.expr=e}evaluate(e,t){return T.newValue(this.expr._getValue())}}class JE{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.cr.map((s=>q(s).evaluate(e,t)));return r.some((s=>s.yr()))?T.mr():T.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function Re(n){return Tn(n)?Number(n.doubleValue):Number(n.integerValue)}function mt(n){return BigInt(n.integerValue)}const XE=BigInt("0x7fffffffffffffff"),ZE=-BigInt("0x8000000000000000");class Is{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length>=2,24778);const r=q(this.expr.params[0]).evaluate(e,t),s=q(this.expr.params[1]).evaluate(e,t);let i=this.br(r,s);for(const a of this.expr.params.slice(2)){const c=q(a).evaluate(e,t);i=this.br(i,c)}return i}br(e,t){if(e.yr()||t.yr())return T.mr();if(e.wr()||t.wr())return T.gr();const r=e.value,s=t.value;if(!Tn(r)&&!ct(r)||!Tn(s)&&!ct(s))return T.mr();if(Tn(r)||Tn(s)){const i=this.Sr(r,s);return i?T.newValue(i):T.mr()}if(ct(r)&&ct(s)){const i=this.vr(r,s);return i===void 0?T.mr():typeof i=="number"?T.newValue({doubleValue:i}):i<ZE||i>XE?T.mr():T.newValue({integerValue:`${i}`})}return T.mr()}}function St(n,e){return me(n)!==me(e)?"TYPE_MISMATCH":ze(n)||ze(e)?"NOT_EQ":Ke(n)&&Ke(e)?"EQ":Ke(n)||Ke(e)?"NULL":Xn(n)&&Xn(e)?(function(r,s){var a,c,l,d;if(((a=r.values)==null?void 0:a.length)!==((c=s.values)==null?void 0:c.length))return"NOT_EQ";let i=!1;for(let p=0;p<((d=(l=r.values)==null?void 0:l.length)!=null?d:0);p++){const m=r.values[p],w=s.values[p];switch(St(m,w)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:$(44609,{Dr:m,Cr:w})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):pi(n)&&pi(e)||In(n)&&In(e)?(function(r,s){const i=r.fields||{},a=s.fields||{};if(fi(i)!==fi(a))return"NOT_EQ";let c=!1;for(const l in i)if(i.hasOwnProperty(l)){if(a[l]===void 0)return"NOT_EQ";switch(St(i[l],a[l])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return et(r,s,{u:!1,i:!0,o:!0})})(n,e)?"EQ":"NOT_EQ"}class eT extends Is{vr(e,t){return mt(e)+mt(t)}Sr(e,t){return{doubleValue:Re(e)+Re(t)}}}class tT extends Is{constructor(e){super(e),this.expr=e}vr(e,t){return mt(e)-mt(t)}Sr(e,t){return{doubleValue:Re(e)-Re(t)}}}class nT extends Is{constructor(e){super(e),this.expr=e}vr(e,t){return mt(e)*mt(t)}Sr(e,t){return{doubleValue:Re(e)*Re(t)}}}class rT extends Is{constructor(e){super(e),this.expr=e}vr(e,t){const r=mt(t);if(r!==BigInt(0))return mt(e)/r}Sr(e,t){const r=Re(t);return r===0?{doubleValue:Qr(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Re(e)/r}}}class sT extends Is{constructor(e){super(e),this.expr=e}vr(e,t){const r=mt(t);if(r!==BigInt(0))return mt(e)%r}Sr(e,t){const r=Re(t);if(r!==0)return{doubleValue:Re(e)%r}}}class iT{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((i=c.value)!=null&&i.booleanValue))return T.newValue(ve);break;case"NULL":s=!0;break;default:r=!0}}return r?T.mr():s?T.gr():T.newValue(qe)}}class Ji{constructor(e){this.expr=e}evaluate(e,t){var s;F(this.expr.params.length===1,9634);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return T.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return T.gr();default:return T.mr()}}}class oT{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if((i=c.value)!=null&&i.booleanValue)return T.newValue(qe);break;case"NULL":s=!0;break;default:r=!0}}return r?T.mr():s?T.gr():T.newValue(ve)}}class ja{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":r=ja.xor(r,!!((i=c.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return T.mr()}}return s?T.gr():T.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Wd{constructor(e){this.expr=e}evaluate(e,t){var a,c,l;F(this.expr.params.length===2,55094);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();for(const d of(l=(c=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:c.values)!=null?l:[])switch(Ke(s.value)&&Ke(d)?"EQ":St(s.value,d)){case"EQ":return T.newValue(qe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:$(44608,{value:s.value,candidate:d})}return r?T.gr():T.newValue(ve)}}class aT{constructor(e){this.expr=e}evaluate(e,t){return new Ji(new C("not",[new C("equal_any",this.expr.params)])).evaluate(e,t)}}class cT{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,23322);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return T.newValue(ve);case"DOUBLE":return T.newValue({booleanValue:isNaN(Re(r.value))});case"NULL":return T.gr();default:return T.mr()}}}class uT{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,50406),new Ji(new C("not",[new C("is_nan",this.expr.params)])).evaluate(e,t)}}class lT{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,23123),q(this.expr.params[0]).evaluate(e,t).type){case"NULL":return T.newValue(qe);case"UNSET":case"ERROR":return T.mr();default:return T.newValue(ve)}}}class hT{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,23167),new Ji(new C("not",[new C("is_null",this.expr.params)])).evaluate(e,t)}}class dT{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,5228),q(this.expr.params[0]).evaluate(e,t).type==="ERROR"?T.newValue(qe):T.newValue(ve)}}class fT{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,6877),q(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return T.mr();case"UNSET":return T.newValue(ve);default:return T.newValue(qe)}}}class pT{constructor(e){this.expr=e}evaluate(e,t){var s;F(this.expr.params.length===3,11706);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?q(this.expr.params[1]).evaluate(e,t):q(this.expr.params[2]).evaluate(e,t);case"NULL":return q(this.expr.params[2]).evaluate(e,t);default:return T.mr()}}}class mT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||je(i.value,s.value)>0?i:s}return s===void 0?T.gr():s}}class gT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||je(i.value,s.value)<0?i:s}return s===void 0?T.gr():s}}class cr{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return T.mr()}const s=q(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return T.mr()}return this.Fr(r,s)}}class _T extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return T.newValue(qe);if(e.wr()||t.wr()||ze(e.value)||ze(t.value)||me(e.value)!==me(t.value))return T.newValue(ve);switch(St(e.value,t.value)){case"EQ":return T.newValue(qe);case"NOT_EQ":return T.newValue(ve);case"NULL":return T.gr();default:$(44615,{left:e,right:t})}}}class yT extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){switch(St(e.value,t.value)){case"EQ":return T.newValue(ve);case"NOT_EQ":case"TYPE_MISMATCH":return T.newValue(qe);case"NULL":return T.gr();default:$(44614,{left:e,right:t})}}}class ET extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){return me(e.value)!==me(t.value)||ze(e.value)||ze(t.value)?T.newValue(ve):T.newValue({booleanValue:je(e.value,t.value)<0})}}class TT extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){return me(e.value)!==me(t.value)||ze(e.value)||ze(t.value)?T.newValue(ve):St(e.value,t.value)==="EQ"?T.newValue(qe):T.newValue({booleanValue:je(e.value,t.value)<0})}}class wT extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){return me(e.value)!==me(t.value)||ze(e.value)||ze(t.value)?T.newValue(ve):T.newValue({booleanValue:je(e.value,t.value)>0})}}class IT extends cr{constructor(e){super(e),this.expr=e}Fr(e,t){return me(e.value)!==me(t.value)||ze(e.value)||ze(t.value)?T.newValue(ve):St(e.value,t.value)==="EQ"?T.newValue(qe):T.newValue({booleanValue:je(e.value,t.value)>0})}}class vT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class AT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,216);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"ARRAY":{const a=(i=(s=r.value.arrayValue)==null?void 0:s.values)!=null?i:[];return T.newValue({arrayValue:{values:[...a].reverse()}})}default:return T.mr()}}}class RT{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===2,52884),new Wd(new C("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class PT{constructor(e){this.expr=e}evaluate(e,t){var l,d,p,m,w,V;F(this.expr.params.length===2,1392);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const a=(p=(d=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:d.values)!=null?p:[],c=(V=(w=(m=s.value)==null?void 0:m.arrayValue)==null?void 0:w.values)!=null?V:[];for(const k of a){let U=!1;r=!1;for(const M of c){switch(Ke(k)&&Ke(M)?"EQ":St(k,M)){case"EQ":U=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:$(44613,{value:M,search:k})}if(U)break}if(!U)return T.newValue(ve)}return T.newValue(qe)}}class ST{constructor(e){this.expr=e}evaluate(e,t){var l,d,p,m,w,V;F(this.expr.params.length===2,2680);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const a=(p=(d=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:d.values)!=null?p:[],c=(V=(w=(m=s.value)==null?void 0:m.arrayValue)==null?void 0:w.values)!=null?V:[];for(const k of c)for(const U of a)switch(Ke(k)&&Ke(U)?"EQ":St(k,U)){case"EQ":return T.newValue(qe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:$(60403,{value:k,search:U})}return r?T.gr():T.newValue(ve)}}class VT{constructor(e){this.expr=e}evaluate(e,t){var s,i,a,c;F(this.expr.params.length===1,38605);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"ARRAY":return T.newValue({integerValue:`${(c=(a=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)!=null?c:0}`});default:return T.mr()}}}class CT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class bT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,1508);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const c=pe.fromBase64String(a).toUint8Array();return c.reverse(),T.newValue({bytesValue:pe.fromUint8Array(c).toBase64()})}return T.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=r.value)==null?void 0:i.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),l=Array.from(c,(d=>d.segment)).reverse();return T.newValue({stringValue:l.join("")})}default:return T.mr()}}}class NT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class kT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class DT{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,19400);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"STRING":{const s=(function(a){let c=0;for(let l=0;l<a.length;l++){const d=a.codePointAt(l);if(d===void 0)return;if(d<=65535)if(d>=55296&&d<=57343)if(d<=56319){const p=a.codePointAt(l+1);p!==void 0&&p>=56320&&p<=57343?(c+=1,l++):c+=1}else c+=1;else c+=1;else{if(!(d<=1114111))return;c+=1,l++}}return c})(r.value.stringValue);return s===void 0?T.mr():T.newValue({integerValue:s})}default:return T.mr()}}}class xT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,8486);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;return typeof a=="string"?T.newValue({integerValue:pe.fromBase64String(a).toUint8Array().length}):T.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(l){let d=0;for(let p=0;p<l.length;p++){const m=l.codePointAt(p);if(m===void 0)return;if(m>=55296&&m<=57343){if(!(m<=56319))return;{const w=l.codePointAt(p+1);if(w===void 0||!(w>=56320&&w<=57343))return;d+=4,p++}}else if(m<=127)d+=1;else if(m<=2047)d+=2;else if(m<=65535)d+=3;else{if(!(m<=1114111))return;d+=4,p++}}return d})((i=r.value)==null?void 0:i.stringValue);return a===void 0?T.mr():T.newValue({integerValue:a})}case"NULL":return T.gr();default:return T.mr()}}}class ur{constructor(e){this.expr=e}evaluate(e,t){var a,c;F(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return T.mr()}return r?T.gr():this.Or((a=s.value)==null?void 0:a.stringValue,(c=i.value)==null?void 0:c.stringValue)}}class OT extends ur{Or(e,t){try{const r=(function(a){let c="";for(let l=0;l<a.length;l++){const d=a.charAt(l);switch(d){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+d;break;default:c+=d}}return"^"+c+"$"})(t),s=ua.compile(r);return T.newValue({booleanValue:s.matches(e)})}catch(r){return st(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),T.mr()}}}class LT extends ur{Or(e,t){try{const r=ua.compile(t);return T.newValue({booleanValue:r.test(e)})}catch(r){return st(`Invalid regex pattern found in regex_contains: ${t}, returning error`),T.mr()}}}class MT extends ur{Or(e,t){try{return T.newValue({booleanValue:ua.compile(t).matches(e)})}catch(r){return st(`Invalid regex pattern found in regex_match: ${t}, returning error`),T.mr()}}}class UT extends ur{Or(e,t){return T.newValue({booleanValue:e.includes(t)})}}class FT extends ur{Or(e,t){return T.newValue({booleanValue:e.startsWith(t)})}}class BT extends ur{Or(e,t){return T.newValue({booleanValue:e.endsWith(t)})}}class $T{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,29079);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return T.gr();default:return T.mr()}}}class qT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,60487);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return T.gr();default:return T.mr()}}}class jT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,28544);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return T.gr();default:return T.mr()}}}class zT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((a=>q(a).evaluate(e,t)));let s="",i=!1;for(const a of r)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return T.mr()}return i?T.gr():T.newValue({stringValue:s})}}class HT{constructor(e){this.expr=e}evaluate(e,t){var a,c,l,d;F(this.expr.params.length===2,4483);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return T.pr();case"MAP":break;default:return T.mr()}const s=q(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return T.mr();const i=(d=(c=(a=r.value)==null?void 0:a.mapValue)==null?void 0:c.fields)==null?void 0:d[(l=s.value)==null?void 0:l.stringValue];return i===void 0?T.pr():T.newValue(i)}}class za{constructor(e){this.expr=e}evaluate(e,t){var d,p;F(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const a=Ko(s.value),c=Ko(i.value);if(a===void 0||c===void 0||((d=a.values)==null?void 0:d.length)!==((p=c.values)==null?void 0:p.length))return T.mr();const l=this.Mr(a,c);return l===void 0||isNaN(l)?T.mr():T.newValue({doubleValue:l})}}class WT extends za{Mr(e,t){var d,p;const r=(d=e==null?void 0:e.values)!=null?d:[],s=(p=t==null?void 0:t.values)!=null?p:[];if(r.length===0)return;let i=0,a=0,c=0;for(let m=0;m<r.length;m++){if(!Zt(r[m])||!Zt(s[m]))return;const w=Re(r[m]),V=Re(s[m]);i+=w*V,a+=w*w,c+=V*V}const l=Math.sqrt(a)*Math.sqrt(c);if(l!==0)return 1-Math.max(-1,Math.min(1,i/l))}}class GT extends za{Mr(e,t){var a,c;const r=(a=e==null?void 0:e.values)!=null?a:[],s=(c=t==null?void 0:t.values)!=null?c:[];if(r.length===0)return 0;let i=0;for(let l=0;l<r.length;l++){if(!Zt(r[l])||!Zt(s[l]))return;i+=Re(r[l])*Re(s[l])}return i}}class KT extends za{Mr(e,t){var a,c;const r=(a=e==null?void 0:e.values)!=null?a:[],s=(c=t==null?void 0:t.values)!=null?c:[];if(r.length===0)return 0;let i=0;for(let l=0;l<r.length;l++){if(!Zt(r[l])||!Zt(s[l]))return;const d=Re(r[l]),p=Re(s[l]);i+=Math.pow(d-p,2)}return Math.sqrt(i)}}class QT{constructor(e){this.expr=e}evaluate(e,t){var s,i;F(this.expr.params.length===1,39044);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const a=Ko(r.value);return T.newValue({integerValue:(i=(s=a==null?void 0:a.values)==null?void 0:s.length)!=null?i:0})}case"NULL":return T.gr();default:return T.mr()}}}const is=BigInt(-62135596800),os=BigInt(253402300799),vi=BigInt(1e3),Kt=BigInt(1e6),YT=is*vi,JT=os*vi+BigInt(999),XT=is*Kt,ZT=os*Kt+BigInt(999999);function Ha(n){return n>=XT&&n<=ZT}function Gd(n){return n>=is&&n<=os}function as(n,e){const t=BigInt(n);return!(t<is||t>os)&&!(e<0||e>=1e9)&&(t!==is||e===0)&&!(t===os&&e>999999999)}function Kd(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function Wa(n){return BigInt(n.seconds)*Kt+BigInt(Math.trunc(n.nanoseconds/1e3))}class Ga{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return T.gr();default:return T.mr()}}}class ew extends Ga{toTimestamp(e){if(!Ha(e))return T.mr();let t=Number(e/Kt),r=Number(e%Kt*BigInt(1e3));const s=Kd(t,r);return t=s.seconds,r=s.nanos,as(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.mr()}}class tw extends Ga{toTimestamp(e){if(!(function(a){return a>=YT&&a<=JT})(e))return T.mr();let t=Number(e/vi),r=Number(e%vi*BigInt(1e6));const s=Kd(t,r);return t=s.seconds,r=s.nanos,as(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.mr()}}class nw extends Ga{toTimestamp(e){if(!Gd(e))return T.mr();const t=Number(e);return T.newValue({timestampValue:{seconds:t,nanos:0}})}}class Ka{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return T.gr();default:return T.mr()}const s=ba(r.value.timestampValue);return as(s.seconds,s.nanoseconds)?this.Nr(s):T.mr()}}class rw extends Ka{Nr(e){const t=Wa(e);return Ha(t)?T.newValue({integerValue:`${t.toString()}`}):T.mr()}}class sw extends Ka{Nr(e){const t=Wa(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?T.newValue({integerValue:r.toString()}):T.newValue({integerValue:(r-BigInt(1)).toString()})}}class iw extends Ka{Nr(e){const t=BigInt(e.seconds);return Gd(t)?T.newValue({integerValue:t.toString()}):T.mr()}}class Qd{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return T.mr()}const i=q(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(Z){switch(Z){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return T.mr();break;case"NULL":r=!0;break;default:return T.mr()}const c=q(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const l=BigInt(c.value.integerValue);let d;try{switch(a){case"microsecond":d=l;break;case"millisecond":d=l*BigInt(1e3);break;case"second":d=l*BigInt(1e6);break;case"minute":d=l*BigInt(6e7);break;case"hour":d=l*BigInt(36e8);break;case"day":d=l*BigInt(864e8);break;default:return T.mr()}if(a!=="microsecond"&&l!==BigInt(0)&&d/l!==BigInt(this.Lr(a)))return T.mr()}catch(K){return st(`Error during timestamp arithmetic: ${K}`),T.mr()}const p=ba(s.value.timestampValue);if(!as(p.seconds,p.nanoseconds))return T.mr();const m=Wa(p),w=this.Br(m,d);if(!Ha(w))return T.mr();const V=Number(w/Kt),k=w%Kt,U=Number((k<0?k+Kt:k)*BigInt(1e3)),M=k<0?V-1:V;return as(M,U)?T.newValue({timestampValue:{seconds:M,nanos:U}}):T.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class ow extends Qd{Br(e,t){return e+t}}class aw extends Qd{Br(e,t){return e-t}}function cs(n){if((n=Hd(n))instanceof ws)return`fld(${n.fieldName})`;if(n instanceof ar)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ae?`ref(${t.path})`:t instanceof $e?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof C)return`fn(${n.name},[${n.params.map(cs).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.cr.map(cs).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function cw(n){if(n instanceof qd)return`${n._name}(${Gs(n.fields)})`;if(n instanceof jd){let e=`${n._name}(${Gs(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${Gs(n.groups)})`),e}if(n instanceof zd)return`${n._name}(${Gs(n.groups)})`;if(n instanceof Ki)return`${n._name}(${n.hr})`;if(n instanceof Qi)return`${n._name}(${n.collectionId})`;if(n instanceof Ma)return`${n._name}()`;if(n instanceof Ua)return`${n._name}(${n.Tr.sort()})`;if(n instanceof Fa)return`${n._name}(${cs(n.condition)})`;if(n instanceof ss)return`${n._name}(${n.limit})`;if(n instanceof Ba)return`${n._name}(${(function(t){return t.map((r=>`${cs(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function Gs(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${cs(t)}`)).join(",")}`}function vt(n){return n.stages.map((e=>cw(e))).join("|")}function Yd(n,e){return vt(n)===vt(e)}function Te(n){return n instanceof Ue}function Tl(n){return Te(n)?vt(n):$r(n)}function Jd(n){return Te(n)?vt(n):(function(t){return`${id(ht(t))}|lt:${t.limitType}`})(n)}function Xi(n,e){return n instanceof Ue&&e instanceof Ue?Yd(n,e):!(n instanceof Ue&&!(e instanceof Ue)||!(n instanceof Ue)&&e instanceof Ue)&&Py(n,e)}function Xd(n){return yn(n)?vt(n):id(n)}function Zd(n,e){return n instanceof Ue&&e instanceof Ue?Yd(n,e):!(n instanceof Ue&&!(e instanceof Ue)||!(n instanceof Ue)&&e instanceof Ue)&&od(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uw{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&oy(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Fr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Fr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=hd();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const l=Yh(a,c);l!==null&&r.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(z.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Q())}isEqual(e){return this.batchId===e.batchId&&Gn(this.mutations,e.mutations,((t,r)=>Ju(t,r)))&&Gn(this.baseMutations,e.baseMutations,((t,r)=>Ju(t,r)))}}class Qa{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){F(e.mutations.length===r.length,58842,{Ur:e.mutations.length,kr:r.length});let s=(function(){return Ny})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new Qa(e,t,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ef="";function lw(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=wl(e)),e=hw(n.get(t),e);return wl(e)}function hw(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case ef:t+="";break;default:t+=i}}return t}function wl(n){return n+ef+""}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dw{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It{constructor(e,t,r,s,i=z.min(),a=z.min(),c=pe.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new It(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new It(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new It(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new It(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fw{constructor(e){this.$r=e}}function pw(n){const e=Ky({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Yo(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mw{constructor(){this.Zi=new gw}addToCollectionParentIndex(e,t){return this.Zi.add(t),b.resolve()}getCollectionParents(e,t){return b.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return b.resolve()}deleteFieldIndex(e,t){return b.resolve()}deleteAllFieldIndexes(e){return b.resolve()}createTargetIndexes(e,t){return b.resolve()}getDocumentsMatchingTarget(e,t){return b.resolve(null)}getIndexType(e,t){return b.resolve(0)}getFieldIndexes(e,t){return b.resolve([])}getNextCollectionGroupToUpdate(e){return b.resolve(null)}getMinOffset(e,t){return b.resolve(en.min())}getMinOffsetFromCollectionGroup(e,t){return b.resolve(en.min())}updateCollectionGroup(e,t,r){return b.resolve()}updateIndexEntries(e,t){return b.resolve()}}class gw{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new de(ee.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new de(ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new rn(0)}static bs(){return new rn(-1)}}// Copyright 2024 Google LLC* @license
function tf(n,e){var r;let t=e;for(const s of n.stages)t=yw({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function Zi(n,e){return tf(n,[e]).length>0}function _w(n,e){return Te(n)?Zi(n,e):$i(n,e)}function yw(n,e,t){if(e instanceof Ki)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.hr))})(0,e,t);if(e instanceof Fa)return(function(s,i,a){return a.filter((c=>{const l=zr(q(i.condition).evaluate(s,c));return l!==void 0&&et(l,qe)}))})(n,e,t);if(e instanceof Qi)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Ma)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof Ua)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&i.Pr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof ss)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof Ba)return(function(s,i,a){const c=i.orderings.map((l=>({Ms:q(l.expr),direction:l.direction})));return[...a].sort(((l,d)=>{for(const{Ms:p,direction:m}of c){const w=zr(p.evaluate(s,l)),V=zr(p.evaluate(s,d)),k=je(w!=null?w:Yn,V!=null?V:Yn);if(k!==0)return m==="ascending"?k:-k}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function na(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof Ba)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=zr(q(s.expr).evaluate({serializer:n.serializer},t)),a=zr(q(s.expr).evaluate({serializer:n.serializer},r)),c=je(i||Yn,a||Yn);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function Lo(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof ss)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ew{constructor(){this.changes=new Cn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ce.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?b.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tw{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ww{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Fr(r.mutation,s,Ge.empty(),te.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,Q()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=Q()){const s=qt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let a=Mn();return i.forEach(((c,l)=>{a=a.insert(c,l.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=qt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,Q())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,c)=>{t.set(a,c)}))}))}computeViews(e,t,r,s){let i=Be();const a=qr(),c=(function(){return qr()})();return t.forEach(((l,d)=>{const p=r.get(d.key);s.has(d.key)&&(p===void 0||p.mutation instanceof un)?i=i.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),Fr(p.mutation,d,p.mutation.getFieldMask(),te.now())):a.set(d.key,Ge.empty())})),this.recalculateAndSaveOverlays(e,i).next((l=>(l.forEach(((d,p)=>a.set(d,p))),t.forEach(((d,p)=>{var m;return c.set(d,new Tw(p,(m=a.get(d))!=null?m:null))})),c)))}recalculateAndSaveOverlays(e,t){const r=qr();let s=new ie(((a,c)=>a-c)),i=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const c of a)c.keys().forEach((l=>{const d=t.get(l);if(d===null)return;let p=r.get(l)||Ge.empty();p=c.applyToLocalView(d,p),r.set(l,p);const m=(s.get(c.batchId)||Q()).add(l);s=s.insert(c.batchId,m)}))})).next((()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),d=l.key,p=l.value,m=hd();p.forEach((w=>{if(!i.has(w)){const V=Yh(t.get(w),r.get(w));V!==null&&m.set(w,V),i=i.add(w)}})),a.push(this.documentOverlayCache.saveOverlays(e,d,m))}return b.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return Te(t)?this.getDocumentsMatchingPipeline(e,t,r,s):vy(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Ay(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):b.resolve(qt());let c=ts,l=i;return a.next((d=>b.forEach(d,((p,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(p)?b.resolve():this.remoteDocumentCache.getEntry(e,p).next((w=>{l=l.insert(p,w)}))))).next((()=>this.populateOverlays(e,d,i))).next((()=>this.computeViews(e,l,d,Q()))).next((p=>({batchId:c,changes:ld(p)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new B(t)).next((r=>{let s=Mn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=Mn();return this.indexManager.getCollectionParents(e,i).next((c=>b.forEach(c,(l=>{const d=(function(m,w){return new Fi(w,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)})(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next((p=>{p.forEach(((m,w)=>{a=a.insert(m,w)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>$i(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(Gt(t)==="collection_group"){const i=qa(t);let a=Mn();return this.indexManager.getCollectionParents(e,i).next((c=>b.forEach(c,(l=>{const d=(function(m,w){const V=m.stages.map((k=>k instanceof Qi?new Ki(w.canonicalString(),{}):k));return new Ue(m.serializer,V)})(t,l.child(i));return this.getDocumentsMatchingPipeline(e,d,r,s).next((p=>{p.forEach(((m,w)=>{a=a.insert(m,w)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((a=>{switch(i=a,Gt(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=Q();for(const l of ta(t))c=c.add(B.fromPath(l));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new L("invalid-argument",`Invalid pipeline source to execute offline: ${vt(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>Zi(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,a)=>{const c=a.getKey();t.get(c)===null&&(t=t.insert(c,Ce.newInvalidDocument(c)))}));let s=Mn();return t.forEach(((i,a)=>{const c=e.get(i);c!==void 0&&Fr(c.mutation,a,Ge.empty(),te.now()),r(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,r){switch(Gt(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ee.fromString(Yi(t)),r);case"collection_group":throw new L("invalid-argument",`Unexpected collection group pipeline: ${vt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,ta(t).map((s=>B.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new L("invalid-argument",`Failed to get overlays for pipeline: ${vt(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iw{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return b.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:dt(s.createTime)}})(t)),b.resolve()}getNamedQuery(e,t){return b.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(s){return{name:s.name,query:pw(s.bundledQuery),readTime:dt(s.readTime)}})(t)),b.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vw{constructor(){this.overlays=new ie(B.comparator),this.Gs=new Map}getOverlay(e,t){return b.resolve(this.overlays.get(t))}getOverlays(e,t){const r=qt();return b.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=qt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),b.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Zr(e,t,i)})),b.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Gs.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Gs.delete(r)),b.resolve()}getOverlaysForCollection(e,t,r){const s=qt(),i=t.length+1,a=new B(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,d=l.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return b.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ie(((d,p)=>d-p));const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let p=i.get(d.largestBatchId);p===null&&(p=qt(),i=i.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const c=qt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((d,p)=>c.set(d,p))),!(c.size()>=s)););return b.resolve(c)}Zr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Gs.get(s.largestBatchId).delete(r.key);this.Gs.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new dw(t,r));let i=this.Gs.get(t);i===void 0&&(i=Q(),this.Gs.set(t,i)),this.Gs.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aw{constructor(){this.sessionToken=pe.EMPTY_BYTE_STRING}getSessionToken(e){return b.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,b.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ya{constructor(){this.zs=new de(Ie.js),this.Hs=new de(Ie.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const r=new Ie(e,t);this.zs=this.zs.add(r),this.Hs=this.Hs.add(r)}Ys(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Zs(new Ie(e,t))}Xs(e,t){e.forEach((r=>this.removeReference(r,t)))}e_(e){const t=new B(new ee([])),r=new Ie(t,e),s=new Ie(t,e+1),i=[];return this.Hs.forEachInRange([r,s],(a=>{this.Zs(a),i.push(a.key)})),i}t_(){this.zs.forEach((e=>this.Zs(e)))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new B(new ee([])),r=new Ie(t,e),s=new Ie(t,e+1);let i=Q();return this.Hs.forEachInRange([r,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new Ie(e,0),r=this.zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ie{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return B.comparator(e.key,t.key)||Y(e.r_,t.r_)}static Js(e,t){return Y(e.r_,t.r_)||B.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rw{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new de(Ie.js)}checkEmpty(e){return b.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new uw(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.i_=this.i_.add(new Ie(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return b.resolve(a)}lookupMutationBatch(e,t){return b.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.__(r),i=s<0?0:s;return b.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return b.resolve(this.mutationQueue.length===0?Aa:this.Gr-1)}getAllMutationBatches(e){return b.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ie(t,0),s=new Ie(t,Number.POSITIVE_INFINITY),i=[];return this.i_.forEachInRange([r,s],(a=>{const c=this.s_(a.r_);i.push(c)})),b.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(Y);return t.forEach((s=>{const i=new Ie(s,0),a=new Ie(s,Number.POSITIVE_INFINITY);this.i_.forEachInRange([i,a],(c=>{r=r.add(c.r_)}))})),b.resolve(this.o_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;B.isDocumentKey(i)||(i=i.child(""));const a=new Ie(new B(i),0);let c=new de(Y);return this.i_.forEachWhile((l=>{const d=l.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(l.r_)),!0)}),a),b.resolve(this.o_(c))}o_(e){const t=[];return e.forEach((r=>{const s=this.s_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){F(this.a_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.i_;return b.forEach(t.mutations,(s=>{const i=new Ie(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.i_=r}))}Hr(e){}containsKey(e,t){const r=new Ie(t,0),s=this.i_.firstAfterOrEqual(r);return b.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,b.resolve()}a_(e,t){return this.__(e)}__(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pw{constructor(e){this.u_=e,this.docs=(function(){return new ie(B.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.u_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return b.resolve(r?r.document.mutableCopy():Ce.newInvalidDocument(t))}getEntries(e,t){let r=Be();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ce.newInvalidDocument(s))})),b.resolve(r)}getAllEntries(e){let t=Be();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),b.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,a;Te(t)?(i=ee.fromString(Yi(t)),a=p=>Zi(t,p)):(i=t.path,a=p=>$i(t,p));let c=Be();const l=new B(i.child("__id-9223372036854775808__")),d=this.docs.getIteratorFrom(l);for(;d.hasNext();){const{key:p,value:{document:m}}=d.getNext();if(!i.isPrefixOf(p.path))break;p.path.length>i.length+1||Ty(Ey(m),r)<=0||(s.has(m.key)||a(m))&&(c=c.insert(m.key,m.mutableCopy()))}return b.resolve(c)}getAllFromCollectionGroup(e,t,r,s){$(9500)}c_(e,t){return b.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new Sw(this)}getSize(e){return b.resolve(this.size)}}class Sw extends Ew{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.$s.addEntry(e,s)):this.$s.removeEntry(r)})),b.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vw{constructor(e){this.persistence=e,this.l_=new Cn((t=>Xd(t)),Zd),this.lastRemoteSnapshotVersion=z.min(),this.highestTargetId=0,this.E_=0,this.h_=new Ya,this.targetCount=0,this.T_=rn.ws()}forEachTarget(e,t){return this.l_.forEach(((r,s)=>t(s))),b.resolve()}getLastRemoteSnapshotVersion(e){return b.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return b.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),b.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.E_&&(this.E_=t),b.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new rn(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,b.resolve()}updateTargetData(e,t){return this.Ds(t),b.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,b.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.l_.forEach(((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.l_.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),b.waitFor(i).next((()=>s))}getTargetCount(e){return b.resolve(this.targetCount)}getTargetData(e,t){const r=this.l_.get(t)||null;return b.resolve(r)}addMatchingKeys(e,t,r){return this.h_.Ys(t,r),b.resolve()}removeMatchingKeys(e,t,r){this.h_.Xs(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),b.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),b.resolve()}getMatchingKeysForTargetId(e,t){const r=this.h_.n_(t);return b.resolve(r)}containsKey(e,t){return b.resolve(this.h_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nf{constructor(e,t){this.P_={},this.overlays={},this.I_=new zi(0),this.R_=!1,this.R_=!0,this.A_=new Aw,this.referenceDelegate=e(this),this.V_=new Vw(this),this.indexManager=new mw,this.remoteDocumentCache=(function(s){return new Pw(s)})((r=>this.referenceDelegate.d_(r))),this.serializer=new fw(t),this.f_=new Iw(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vw,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.P_[e.toKey()];return r||(r=new Rw(t,this.referenceDelegate),this.P_[e.toKey()]=r),r}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,r){O("MemoryPersistence","Starting transaction:",e);const s=new Cw(this.I_.next());return this.referenceDelegate.m_(),r(s).next((i=>this.referenceDelegate.p_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}g_(e,t){return b.or(Object.values(this.P_).map((r=>()=>r.containsKey(e,t))))}}class Cw extends wE{constructor(e){super(),this.currentSequenceNumber=e}}class Ja{constructor(e){this.persistence=e,this.y_=new Ya,this.w_=null}static b_(e){return new Ja(e)}get S_(){if(this.w_)return this.w_;throw $(60996)}addReference(e,t,r){return this.y_.addReference(r,t),this.S_.delete(r.toString()),b.resolve()}removeReference(e,t,r){return this.y_.removeReference(r,t),this.S_.add(r.toString()),b.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),b.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach((s=>this.S_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.S_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return b.forEach(this.S_,(r=>{const s=B.fromPath(r);return this.v_(e,s).next((i=>{i||t.removeEntry(s,z.min())}))})).next((()=>(this.w_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((r=>{r?this.S_.delete(t.toString()):this.S_.add(t.toString())}))}d_(e){return 0}v_(e,t){return b.or([()=>b.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class Ai{constructor(e,t){this.persistence=e,this.D_=new Cn((r=>lw(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=PE(this,t)}static b_(e,t){return new Ai(e,t)}m_(){}p_(e){return b.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}sr(e,t){return b.forEach(this.D_,((r,s)=>this.Os(e,r,s).next((i=>i?b.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.c_(e,(a=>this.Os(e,a,t).next((c=>{c||(r++,i.removeEntry(a,z.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),b.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),b.resolve()}removeReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),b.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),b.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ei(e.data.value)),t}Os(e,t,r){return b.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.D_.get(t);return b.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Vo=r,this.fo=s}static mo(e,t){let r=Q(),s=Q();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Xa(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bw(n,e){return B.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nw{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kw{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=(function(){return Cp()?8:IE(be())>0?6:4})()}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.vo(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.Do(e,t,s,r).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new Nw;return this.xo(e,t,a).next((c=>{if(i.result=c,this.yo)return this.Co(e,t,a,c.size)}))})).next((()=>i.result))}Co(e,t,r,s){return Te(t)?b.resolve():r.documentReadCount<this.wo?(On()<=J.DEBUG&&O("QueryEngine","SDK will not create cache indexes for query:",$r(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),b.resolve()):(On()<=J.DEBUG&&O("QueryEngine","Query:",$r(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.bo*s?(On()<=J.DEBUG&&O("QueryEngine","The SDK decides to create cache indexes for query:",$r(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ht(t))):b.resolve())}vo(e,t){if(Te(t))return b.resolve(null);let r=t;if(rl(r))return b.resolve(null);let s=ht(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=Yo(r,null,"F"),s=ht(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const c=Q(...a);return this.So.getDocuments(e,c).next((l=>this.indexManager.getMinOffset(e,s).next((d=>{const p=this.Fo(r,l);return this.Oo(r,p,c,d.readTime)?this.vo(e,Yo(r,null,"F")):this.Mo(e,p,r,d)}))))})))))}Do(e,t,r,s){return(Te(t)?(function(a){for(const c of a.stages){if(c instanceof ss||c instanceof El)return!1;if(c instanceof Fa){if(c.condition instanceof Fd&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof ws&&c.condition._expr.params[0].fieldName===Kn)continue;return!1}}return!0})(t):rl(t))||s.isEqual(z.min())?b.resolve(null):this.So.getDocuments(e,r).next((i=>{const a=this.Fo(t,i);return this.Oo(t,a,r,s)?b.resolve(null):(On()<=J.DEBUG&&O("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Tl(t)),this.Mo(e,a,t,yy(s,ts)).next((c=>c)))}))}Fo(e,t){let r,s;return Te(e)?(r=new de(bw),s=i=>Zi(e,i)):(r=new de(Va(e)),s=i=>$i(e,i)),t.forEach(((i,a)=>{s(a)&&(r=r.add(a))})),r}Oo(e,t,r,s){if(Te(e))return(function(c){return c.stages.some((l=>l instanceof ss||l instanceof El))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}xo(e,t,r){return On()<=J.DEBUG&&O("QueryEngine","Using full collection scan to execute query:",Tl(t)),this.So.getDocumentsMatchingQuery(e,t,en.min(),r)}Mo(e,t,r,s){return this.So.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Za="LocalStore",Dw=3e8;class xw{constructor(e,t,r,s){this.persistence=e,this.No=t,this.serializer=s,this.Lo=new ie(Y),this.Bo=new Cn((i=>Xd(i)),Zd),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(r)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new ww(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Lo)))}}function Ow(n,e,t,r){return new xw(n,e,t,r)}function rf(n,e){return _(this,null,function*(){const t=H(n);return yield t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.qo(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const a=[],c=[];let l=Q();for(const d of s){a.push(d.batchId);for(const p of d.mutations)l=l.add(p.key)}for(const d of i){c.push(d.batchId);for(const p of d.mutations)l=l.add(p.key)}return t.localDocuments.getDocuments(r,l).next((d=>({$o:d,removedBatchIds:a,addedBatchIds:c})))}))}))})}function Lw(n,e){const t=H(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.ko.newChangeBuffer({trackRemovals:!0});return(function(c,l,d,p){const m=d.batch,w=m.keys();let V=b.resolve();return w.forEach((k=>{V=V.next((()=>p.getEntry(l,k))).next((U=>{const M=d.docVersions.get(k);F(M!==null,48541),U.version.compareTo(M)<0&&(m.applyToRemoteDocument(U,d),U.isValidDocument()&&(U.setReadTime(d.commitVersion),p.addEntry(U)))}))})),V.next((()=>c.mutationQueue.removeMutationBatch(l,m)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let l=Q();for(let d=0;d<c.mutationResults.length;++d)c.mutationResults[d].transformResults.length>0&&(l=l.add(c.batch.mutations[d].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function sf(n){const e=H(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.V_.getLastRemoteSnapshotVersion(t)))}function Mw(n,e){const t=H(n),r=e.snapshotVersion;let s=t.Lo;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.ko.newChangeBuffer({trackRemovals:!0});s=t.Lo;const c=[];e.targetChanges.forEach(((p,m)=>{const w=s.get(m);if(!w)return;c.push(t.V_.removeMatchingKeys(i,p.removedDocuments,m).next((()=>t.V_.addMatchingKeys(i,p.addedDocuments,m))));let V=w.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?V=V.withResumeToken(pe.EMPTY_BYTE_STRING,z.min()).withLastLimboFreeSnapshotVersion(z.min()):p.resumeToken.approximateByteSize()>0&&(V=V.withResumeToken(p.resumeToken,r)),s=s.insert(m,V),(function(U,M,K){return U.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-U.snapshotVersion.toMicroseconds()>=Dw?!0:K.addedDocuments.size+K.modifiedDocuments.size+K.removedDocuments.size>0})(w,V,p)&&c.push(t.V_.updateTargetData(i,V))}));let l=Be(),d=Q();if(e.documentUpdates.forEach((p=>{e.resolvedLimboDocuments.has(p)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,p))})),c.push(Uw(i,a,e.documentUpdates).next((p=>{l=p.Ko,d=p.Qo}))),!r.isEqual(z.min())){const p=t.V_.getLastRemoteSnapshotVersion(i).next((m=>t.V_.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(p)}return b.waitFor(c).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,l,d))).next((()=>l))})).then((i=>(t.Lo=s,i)))}function Uw(n,e,t){let r=Q(),s=Q();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let a=Be();return t.forEach(((c,l)=>{const d=i.get(c);l.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(z.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):O(Za,"Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",l.version)})),{Ko:a,Qo:s}}))}function Fw(n,e){const t=H(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Aa),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function Bw(n,e){const t=H(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.V_.getTargetData(r,e).next((i=>i?(s=i,b.resolve(s)):t.V_.allocateTargetId(r).next((a=>(s=new It(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.V_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.Lo.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Lo=t.Lo.insert(r.targetId,r),t.Bo.set(e,r.targetId)),r}))}function ra(n,e,t){return _(this,null,function*(){const r=H(n),s=r.Lo.get(e),i=t?"readwrite":"readwrite-primary";try{t||(yield r.persistence.runTransaction("Release target",i,(a=>r.persistence.referenceDelegate.removeTarget(a,s))))}catch(a){if(!or(a))throw a;O(Za,`Failed to update sequence numbers for target ${e}: ${a}`)}r.Lo=r.Lo.remove(e),r.Bo.delete(s.target)})}function Il(n,e,t){const r=H(n);let s=z.min(),i=Q();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(l,d,p){const m=H(l),w=m.Bo.get(p);return w!==void 0?b.resolve(m.Lo.get(w)):m.V_.getTargetData(d,p)})(r,a,Te(e)?e:ht(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(a,c.targetId).next((l=>{i=l}))})).next((()=>r.No.getDocumentsMatchingQuery(a,e,t?s:z.min(),t?i:Q()))).next((c=>($w(r,c),{documents:c,Wo:i})))))}function $w(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Uo.get(s)||z.min();r.readTime.compareTo(i)>0&&n.Uo.set(s,r.readTime)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qw{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){this.Yo===0&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve()))))}ra(e){this.state==="Online"?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,e==="Online"&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?(Pt(t),this.Xo=!1):O("OnlineStateTracker",t)}ia(){this.Zo!==null&&(this.Zo.cancel(),this.Zo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gt="RemoteStore";class jw{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new rn(1e3),this.ca=new rn(1001),this.la=new Set,this.Ea=[],this.ha=i,this.ha.Qe((a=>{r.enqueueAndForget((()=>_(this,null,function*(){Nn(this)&&(O(gt,"Restarting streams for network reachability change."),yield(function(l){return _(this,null,function*(){const d=H(l);d.la.add(4),yield vs(d),d.Ta.set("Unknown"),d.la.delete(4),yield eo(d)})})(this))})))})),this.Ta=new qw(r,s)}}function eo(n){return _(this,null,function*(){if(Nn(n))for(const e of n.Ea)yield e(!0)})}function vs(n){return _(this,null,function*(){for(const e of n.Ea)yield e(!1)})}function sa(n,e){return n.oa.get(e)||void 0}function of(n,e){const t=H(n),r=sa(t,e.targetId);if(r!==void 0&&t._a.has(r))return;const s=(function(c,l){const d=sa(c,l);d!==void 0&&c.aa.delete(d);const p=(function(w,V){return V%2!=0?w.ca.next():w.ua.next()})(c,l);return c.oa.set(l,p),c.aa.set(p,l),p})(t,e.targetId);O(gt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new It(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t._a.set(s,i),rc(t)?nc(t):lr(t).Yt()&&tc(t,i)}function ec(n,e){const t=H(n),r=lr(t),s=sa(t,e);O(gt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t._a.delete(s),t.oa.delete(e),t.aa.delete(s),r.Yt()&&af(t,s),t._a.size===0&&(r.Yt()?r.en():Nn(t)&&t.Ta.set("Unknown"))}function tc(n,e){if(n.Pa.J(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(z.min())>0){const t=n.aa.get(e.targetId);if(t===void 0)return void O(gt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}lr(n).Pn(e)}function af(n,e){n.Pa.J(e),lr(n).In(e)}function nc(n){n.Pa=new My({getRemoteKeysForTarget:e=>{const t=n.aa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Q()},ye:e=>n._a.get(e)||null,Ve:()=>n.datastore.serializer.databaseId}),lr(n).start(),n.Ta.ea()}function rc(n){return Nn(n)&&!lr(n).Jt()&&n._a.size>0}function Nn(n){return H(n).la.size===0}function cf(n){n.Pa=void 0}function zw(n){return _(this,null,function*(){n.Ta.set("Online")})}function Hw(n){return _(this,null,function*(){n._a.forEach(((e,t)=>{tc(n,e)}))})}function Ww(n,e){return _(this,null,function*(){cf(n),rc(n)?(n.Ta.ra(e),nc(n)):n.Ta.set("Unknown")})}function Gw(n,e,t){return _(this,null,function*(){if(n.Ta.set("Online"),e instanceof fd&&e.state===2&&e.cause)try{yield(function(s,i){return _(this,null,function*(){const a=i.cause;for(const c of i.targetIds){if(s._a.has(c)){const l=s.aa.get(c);l!==void 0&&(yield s.remoteSyncer.rejectListen(l,a),s.oa.delete(l),s.aa.delete(c)),s._a.delete(c)}s.Pa.removeTarget(c)}})})(n,e)}catch(r){O(gt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),yield Ri(n,r)}else if(e instanceof ni?n.Pa._e(e):e instanceof dd?n.Pa.he(e):n.Pa.ue(e),!t.isEqual(z.min()))try{const r=yield sf(n.localStore);t.compareTo(r)>=0&&(yield(function(i,a){const c=i.Pa.fe(a);c.targetChanges.forEach(((d,p)=>{if(d.resumeToken.approximateByteSize()>0){const m=i._a.get(p);m&&i._a.set(p,m.withResumeToken(d.resumeToken,a))}})),c.targetMismatches.forEach(((d,p)=>{const m=i._a.get(d);if(!m)return;i._a.set(d,m.withResumeToken(pe.EMPTY_BYTE_STRING,m.snapshotVersion)),af(i,d);const w=new It(m.target,d,p,m.sequenceNumber);tc(i,w)}));const l=(function(p,m){const w=new Map;m.targetChanges.forEach(((k,U)=>{const M=p.aa.get(U);M!==void 0&&w.set(M,k)}));let V=new ie(Y);return m.targetMismatches.forEach(((k,U)=>{const M=p.aa.get(k);M!==void 0&&(V=V.insert(M,U))})),new Es(m.snapshotVersion,w,V,m.documentUpdates,m.augmentedDocumentUpdates,m.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(l)})(n,t))}catch(r){O(gt,"Failed to raise snapshot:",r),yield Ri(n,r)}})}function Ri(n,e,t){return _(this,null,function*(){if(!or(e))throw e;n.la.add(1),yield vs(n),n.Ta.set("Offline"),t||(t=()=>sf(n.localStore)),n.asyncQueue.enqueueRetryable((()=>_(null,null,function*(){O(gt,"Retrying IndexedDB access"),yield t(),n.la.delete(1),yield eo(n)})))})}function uf(n,e){return e().catch((t=>Ri(n,t,e)))}function to(n){return _(this,null,function*(){const e=H(n),t=sn(e);let r=e.sa.length>0?e.sa[e.sa.length-1].batchId:Aa;for(;Kw(e);)try{const s=yield Fw(e.localStore,r);if(s===null){e.sa.length===0&&t.en();break}r=s.batchId,Qw(e,s)}catch(s){yield Ri(e,s)}lf(e)&&hf(e)})}function Kw(n){return Nn(n)&&n.sa.length<10}function Qw(n,e){n.sa.push(e);const t=sn(n);t.Yt()&&t.Rn&&t.An(e.mutations)}function lf(n){return Nn(n)&&!sn(n).Jt()&&n.sa.length>0}function hf(n){sn(n).start()}function Yw(n){return _(this,null,function*(){sn(n).fn()})}function Jw(n){return _(this,null,function*(){const e=sn(n);for(const t of n.sa)e.An(t.mutations)})}function Xw(n,e,t){return _(this,null,function*(){const r=n.sa.shift(),s=Qa.from(r,e,t);yield uf(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),yield to(n)})}function Zw(n,e){return _(this,null,function*(){e&&sn(n).Rn&&(yield(function(r,s){return _(this,null,function*(){if((function(a){return Cy(a)&&a!==N.ABORTED})(s.code)){const i=r.sa.shift();sn(r).Xt(),yield uf(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),yield to(r)}})})(n,e)),lf(n)&&hf(n)})}function vl(n,e){return _(this,null,function*(){const t=H(n);t.asyncQueue.verifyOperationInProgress(),O(gt,"RemoteStore received new credentials");const r=Nn(t);t.la.add(3),yield vs(t),r&&t.Ta.set("Unknown"),yield t.remoteSyncer.handleCredentialChange(e),t.la.delete(3),yield eo(t)})}function eI(n,e){return _(this,null,function*(){const t=H(n);e?(t.la.delete(2),yield eo(t)):e||(t.la.add(2),yield vs(t),t.Ta.set("Unknown"))})}function lr(n){return n.Ia||(n.Ia=(function(t,r,s){const i=H(t);return i.pn(),new fE(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:zw.bind(null,n),Et:Hw.bind(null,n),Tt:Ww.bind(null,n),Tn:Gw.bind(null,n)}),n.Ea.push((e=>_(null,null,function*(){e?(n.Ia.Xt(),rc(n)?nc(n):n.Ta.set("Unknown")):(yield n.Ia.stop(),cf(n))})))),n.Ia}function sn(n){return n.Ra||(n.Ra=(function(t,r,s){const i=H(t);return i.pn(),new pE(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:()=>Promise.resolve(),Et:Yw.bind(null,n),Tt:Zw.bind(null,n),Vn:Jw.bind(null,n),dn:Xw.bind(null,n)}),n.Ea.push((e=>_(null,null,function*(){e?(n.Ra.Xt(),yield to(n)):(yield n.Ra.stop(),n.sa.length>0&&(O(gt,`Stopping write stream with ${n.sa.length} pending writes`),n.sa=[]))})))),n.Ra}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class df{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):Pt("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Ht,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new sc(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new L(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ic(n,e){if(Pt("AsyncQueue",`${e}: ${n}`),or(n))return new L(N.UNAVAILABLE,`${e}: ${n}`);throw n}class Al{constructor(){this.activeTargetIds=xy()}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class tI{constructor(){this.fu=new Al,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,r){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new Al,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function Mo(){return typeof document!="undefined"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{static emptySet(e){return new vn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||B.comparator(t.key,r.key):(t,r)=>B.comparator(t.key,r.key),this.keyedMap=Mn(),this.sortedSet=new ie(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof vn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new vn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rl{constructor(){this.pu=new ie(B.comparator)}track(e){const t=e.doc.key,r=this.pu.get(t);r?e.type!==0&&r.type===3?this.pu=this.pu.insert(t,e):e.type===3&&r.type!==1?this.pu=this.pu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.pu=this.pu.remove(t):e.type===1&&r.type===2?this.pu=this.pu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):$(63341,{we:e,gu:r}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal(((t,r)=>{e.push(r)})),e}}class er{constructor(e,t,r,s,i,a,c,l,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach((c=>{a.push({type:0,doc:c})})),new er(e,t,vn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Xi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nI{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some((e=>e.vu()))}}class rI{constructor(){this.queries=Pl(),this.onlineState="Unknown",this.Du=new Set}terminate(){(function(t,r){const s=H(t),i=s.queries;s.queries=Pl(),i.forEach(((a,c)=>{for(const l of c.bu)l.onError(r)}))})(this,new L(N.ABORTED,"Firestore shutting down"))}}function Pl(){return new Cn((n=>Jd(n)),Xi)}function ff(n,e){return _(this,null,function*(){const t=H(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.Su()&&e.vu()&&(r=2):(i=new nI,r=e.vu()?0:1);try{switch(r){case 0:i.wu=yield t.onListen(s,!0);break;case 1:i.wu=yield t.onListen(s,!1);break;case 2:yield t.onFirstRemoteStoreListen(s)}}catch(a){const c=ic(a,`Initialization of query '${Te(e.query)?vt(e.query):$r(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.bu.push(e),e.xu(t.onlineState),i.wu&&e.Cu(i.wu)&&oc(t)})}function pf(n,e){return _(this,null,function*(){const t=H(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.bu.indexOf(e);a>=0&&(i.bu.splice(a,1),i.bu.length===0?s=e.vu()?0:1:!i.Su()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}})}function sI(n,e){const t=H(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.bu)c.Cu(s)&&(r=!0);a.wu=s}}r&&oc(t)}function iI(n,e,t){const r=H(n),s=r.queries.get(e);if(s)for(const i of s.bu)i.onError(t);r.queries.delete(e)}function oc(n){n.Du.forEach((e=>{e.next()}))}var ia;(function(n){n.Default="default",n.Cache="cache"})(ia||(ia={}));class mf{constructor(e,t,r){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=r||{}}Cu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new er(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Bu(e){e=er.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==ia.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gf{constructor(e){this.key=e}}class _f{constructor(e){this.key=e}}class oI{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=Q(),this.mutatedKeys=Q(),this.Ju=Te(e)?na(e):Va(e),this.Yu=new vn(this.Ju)}get Zu(){return this.zu}Xu(e,t){const r=t?t.ec:new Rl,s=t?t.Yu:this.Yu;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const[l,d]=this.tc(this.query,s);e.inorderTraversal(((m,w)=>{const V=s.get(m),k=_w(this.query,w)?w:null,U=!!V&&this.mutatedKeys.has(V.key),M=!!k&&(k.hasLocalMutations||this.mutatedKeys.has(k.key)&&k.hasCommittedMutations);let K=!1;V&&k?V.data.isEqual(k.data)?U!==M&&(r.track({type:3,doc:k}),K=!0):this.nc(V,k)||(r.track({type:2,doc:k}),K=!0,(l&&this.Ju(k,l)>0||d&&this.Ju(k,d)<0)&&(c=!0)):!V&&k?(r.track({type:0,doc:k}),K=!0):V&&!k&&(r.track({type:1,doc:V}),K=!0,(l||d)&&(c=!0)),K&&(k?(a=a.add(k),i=M?i.add(m):i.delete(m)):(a=a.delete(m),i=i.delete(m)))}));const p=this.rc(this.query);if(p)if(Te(this.query)){const m=[];a.forEach((k=>m.push(k)));const w=tf(this.query,m);let V=new vn(na(this.query));for(const k of w)V=V.add(k);a.forEach((k=>{V.has(k.key)||(i=i.delete(k.key),r.track({type:1,doc:k}))})),a=V}else{const m=this.sc(this.query);for(;a.size>p;){const w=m==="F"?a.last():a.first();a=a.delete(w.key),i=i.delete(w.key),r.track({type:1,doc:w})}}return{Yu:a,ec:r,Oo:c,mutatedKeys:i}}rc(e){var t;return Te(e)?(t=Lo(e))==null?void 0:t.limit:e.limit||void 0}sc(e){if(Te(e)){const t=Lo(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var r;if(Te(e)){const s=(r=Lo(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.rc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const a=e.ec.yu();a.sort(((p,m)=>(function(V,k){const U=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return $(20277,{we:M})}};return U(V)-U(k)})(p.type,m.type)||this.Ju(p.doc,m.doc))),this._c(r),s=s!=null?s:!1;const c=t&&!s?this.oc():[],l=this.Hu.size===0&&this.current&&!s?1:0,d=l!==this.ju;return this.ju=l,a.length!==0||d?{snapshot:new er(this.query,e.Yu,i,a,e.mutatedKeys,l===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),ac:c}:{ac:c}}xu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new Rl,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach((t=>this.zu=this.zu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.zu=this.zu.delete(t))),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=Q(),this.Yu.forEach((r=>{this.uc(r.key)&&(this.Hu=this.Hu.add(r.key))}));const t=[];return e.forEach((r=>{this.Hu.has(r)||t.push(new _f(r))})),this.Hu.forEach((r=>{e.has(r)||t.push(new gf(r))})),t}cc(e){this.zu=e.Wo,this.Hu=Q();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return er.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,this.ju===0,this.hasCachedResults)}}const ac="SyncEngine";class aI{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class cI{constructor(e){this.key=e,this.Ec=!1}}class uI{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.hc={},this.Tc=new Cn((c=>Jd(c)),Xi),this.Pc=new Map,this.Ic=new Set,this.Rc=new ie(B.comparator),this.Ac=new Map,this.Vc=new Ya,this.dc={},this.fc=new Map,this.mc=rn.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return this.gc===!0}}function lI(n,e,t=!0){return _(this,null,function*(){const r=vf(n);let s;const i=r.Tc.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=yield yf(r,e,t,!0),s})}function hI(n,e){return _(this,null,function*(){const t=vf(n);yield yf(t,e,!0,!1)})}function yf(n,e,t,r){return _(this,null,function*(){const s=yield Bw(n.localStore,Te(e)?e:ht(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=yield dI(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&of(n.remoteStore,s),c})}function dI(n,e,t,r,s){return _(this,null,function*(){n.yc=(m,w,V)=>(function(U,M,K,Z){return _(this,null,function*(){let re=M.view.Xu(K);re.Oo&&(re=yield Il(U.localStore,M.query,!1).then((({documents:v})=>M.view.Xu(v,re))));const ke=Z&&Z.targetChanges.get(M.targetId),ge=Z&&Z.targetMismatches.get(M.targetId)!=null,_e=M.view.applyChanges(re,U.isPrimaryClient,ke,ge);return Vl(U,M.targetId,_e.ac),_e.snapshot})})(n,m,w,V);const i=yield Il(n.localStore,e,!0),a=new oI(e,i.Wo),c=a.Xu(i.documents),l=Ts.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,l);Vl(n,t,d.ac);const p=new aI(e,t,a);return n.Tc.set(e,p),n.Pc.has(t)?n.Pc.get(t).push(e):n.Pc.set(t,[e]),d.snapshot})}function fI(n,e,t){return _(this,null,function*(){const r=H(n),s=r.Tc.get(e),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter((a=>!Xi(a,e)))),void r.Tc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||(yield ra(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&ec(r.remoteStore,s.targetId),oa(r,s.targetId)})).catch(ir))):(oa(r,s.targetId),yield ra(r.localStore,s.targetId,!0))})}function pI(n,e){return _(this,null,function*(){const t=H(n),r=t.Tc.get(e),s=t.Pc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),ec(t.remoteStore,r.targetId))})}function mI(n,e,t){return _(this,null,function*(){const r=II(n);try{const s=yield(function(a,c){const l=H(a),d=te.now(),p=c.reduce(((V,k)=>V.add(k.key)),Q());let m,w;return l.persistence.runTransaction("Locally write mutations","readwrite",(V=>{let k=Be(),U=Q();return l.ko.getEntries(V,p).next((M=>{k=M,k.forEach(((K,Z)=>{Z.isValidDocument()||(U=U.add(K))}))})).next((()=>l.localDocuments.getOverlayedDocuments(V,k))).next((M=>{m=M;const K=[];for(const Z of c){const re=ay(Z,m.get(Z.key).overlayedDocument);re!=null&&K.push(new un(Z.key,re,Hh(re.value.mapValue),rt.exists(!0)))}return l.mutationQueue.addMutationBatch(V,d,K,c)})).next((M=>{w=M;const K=M.applyToLocalDocumentSet(m,U);return l.documentOverlayCache.saveOverlays(V,M.batchId,K)}))})).then((()=>({batchId:w.batchId,changes:ld(m)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(a,c,l){let d=a.dc[a.currentUser.toKey()];d||(d=new ie(Y)),d=d.insert(c,l),a.dc[a.currentUser.toKey()]=d})(r,s.batchId,t),yield As(r,s.changes),yield to(r.remoteStore)}catch(s){const i=ic(s,"Failed to persist write");t.reject(i)}})}function Ef(n,e){return _(this,null,function*(){const t=H(n);try{const r=yield Mw(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.Ac.get(i);a&&(F(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Ec=!0:s.modifiedDocuments.size>0?F(a.Ec,14607):s.removedDocuments.size>0&&(F(a.Ec,42227),a.Ec=!1))})),yield As(t,r,e)}catch(r){yield ir(r)}})}function Sl(n,e,t){const r=H(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tc.forEach(((i,a)=>{const c=a.view.xu(e);c.snapshot&&s.push(c.snapshot)})),(function(a,c){const l=H(a);l.onlineState=c;let d=!1;l.queries.forEach(((p,m)=>{for(const w of m.bu)w.xu(c)&&(d=!0)})),d&&oc(l)})(r.eventManager,e),s.length&&r.hc.Tn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}function gI(n,e,t){return _(this,null,function*(){const r=H(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Ac.get(e),i=s&&s.key;if(i){let a=new ie(B.comparator);a=a.insert(i,Ce.newNoDocument(i,z.min()));const c=Q().add(i),l=new Es(z.min(),new Map,new ie(Y),a,Be(),c);yield Ef(r,l),r.Rc=r.Rc.remove(i),r.Ac.delete(e),cc(r)}else yield ra(r.localStore,e,!1).then((()=>oa(r,e,t))).catch(ir)})}function _I(n,e){return _(this,null,function*(){const t=H(n),r=e.batch.batchId;try{const s=yield Lw(t.localStore,e);wf(t,r,null),Tf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),yield As(t,s)}catch(s){yield ir(s)}})}function yI(n,e,t){return _(this,null,function*(){const r=H(n);try{const s=yield(function(a,c){const l=H(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",(d=>{let p;return l.mutationQueue.lookupMutationBatch(d,c).next((m=>(F(m!==null,37113),p=m.keys(),l.mutationQueue.removeMutationBatch(d,m)))).next((()=>l.mutationQueue.performConsistencyCheck(d))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(d,p,c))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p))).next((()=>l.localDocuments.getDocuments(d,p)))}))})(r.localStore,e);wf(r,e,t),Tf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),yield As(r,s)}catch(s){yield ir(s)}})}function Tf(n,e){(n.fc.get(e)||[]).forEach((t=>{t.resolve()})),n.fc.delete(e)}function wf(n,e,t){const r=H(n);let s=r.dc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.dc[r.currentUser.toKey()]=s}}function oa(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Pc.get(e))n.Tc.delete(r),t&&n.hc.wc(r,t);n.Pc.delete(e),n.isPrimaryClient&&n.Vc.e_(e).forEach((r=>{n.Vc.containsKey(r)||If(n,r)}))}function If(n,e){n.Ic.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(ec(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ac.delete(t),cc(n))}function Vl(n,e,t){for(const r of t)r instanceof gf?(n.Vc.addReference(r.key,e),EI(n,r)):r instanceof _f?(O(ac,"Document no longer in limbo: "+r.key),n.Vc.removeReference(r.key,e),n.Vc.containsKey(r.key)||If(n,r.key)):$(19791,{bc:r})}function EI(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Ic.has(r)||(O(ac,"New document in limbo: "+t),n.Ic.add(r),cc(n))}function cc(n){for(;n.Ic.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Ic.values().next().value;n.Ic.delete(e);const t=new B(ee.fromString(e)),r=n.mc.next();n.Ac.set(r,new cI(t)),n.Rc=n.Rc.insert(t,r),of(n.remoteStore,new It(ht(Bi(t.path)),r,"TargetPurposeLimboResolution",zi.wn))}}function As(n,e,t){return _(this,null,function*(){const r=H(n),s=[],i=[],a=[];r.Tc.isEmpty()||(r.Tc.forEach(((c,l)=>{a.push(r.yc(l,e,t).then((d=>{var p;if((d||t)&&r.isPrimaryClient){const m=d?!d.fromCache:(p=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:p.current;r.sharedClientState.updateQueryState(l.targetId,m?"current":"not-current")}if(d){s.push(d);const m=Xa.mo(l.targetId,d);i.push(m)}})))})),yield Promise.all(a),r.hc.Tn(s),yield(function(l,d){return _(this,null,function*(){const p=H(l);try{yield p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(m=>b.forEach(d,(w=>b.forEach(w.Vo,(V=>p.persistence.referenceDelegate.addReference(m,w.targetId,V))).next((()=>b.forEach(w.fo,(V=>p.persistence.referenceDelegate.removeReference(m,w.targetId,V)))))))))}catch(m){if(!or(m))throw m;O(Za,"Failed to update sequence numbers: "+m)}for(const m of d){const w=m.targetId;if(!m.fromCache){const V=p.Lo.get(w),k=V.snapshotVersion,U=V.withLastLimboFreeSnapshotVersion(k);p.Lo=p.Lo.insert(w,U)}}})})(r.localStore,i))})}function TI(n,e){return _(this,null,function*(){const t=H(n);if(!t.currentUser.isEqual(e)){O(ac,"User change. New user:",e.toKey());const r=yield rf(t.localStore,e);t.currentUser=e,(function(i,a){i.fc.forEach((c=>{c.forEach((l=>{l.reject(new L(N.CANCELLED,a))}))})),i.fc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),yield As(t,r.$o)}})}function wI(n,e){const t=H(n),r=t.Ac.get(e);if(r&&r.Ec)return Q().add(r.key);{let s=Q();const i=t.Pc.get(e);if(!i)return s;for(const a of i!=null?i:[]){const c=t.Tc.get(a);s=s.unionWith(c.view.Zu)}return s}}function vf(n){const e=H(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ef.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=wI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=gI.bind(null,e),e.hc.Tn=sI.bind(null,e.eventManager),e.hc.wc=iI.bind(null,e.eventManager),e}function II(n){const e=H(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=_I.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=yI.bind(null,e),e}class Pi{constructor(){this.kind="memory",this.synchronizeTabs=!1}initialize(e){return _(this,null,function*(){this.serializer=qi(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),yield this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)})}Cc(e,t){return null}Fc(e,t){return null}xc(e){return Ow(this.persistence,new kw,e.initialUser,this.serializer)}Dc(e){return new nf(Ja.b_,this.serializer)}vc(e){return new tI}terminate(){return _(this,null,function*(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),yield this.persistence.shutdown()})}}Pi.provider={build:()=>new Pi};class vI extends Pi{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){F(this.persistence.referenceDelegate instanceof Ai,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new AE(r,e.asyncQueue,t)}Dc(e){const t=this.cacheSizeBytes!==void 0?Me.withCacheSize(this.cacheSizeBytes):Me.DEFAULT;return new nf((r=>Ai.b_(r,t)),this.serializer)}}class aa{initialize(e,t){return _(this,null,function*(){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Sl(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=TI.bind(null,this.syncEngine),yield eI(this.remoteStore,this.syncEngine.isPrimaryClient))})}createEventManager(e){return(function(){return new rI})()}createDatastore(e){const t=qi(e.databaseInfo.databaseId),r=dE(e.databaseInfo);return _E(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,a,c){return new jw(r,s,i,a,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>Sl(this.syncEngine,t,0)),(function(){return hl.Ye()?new hl:new cE})())}createSyncEngine(e,t){return(function(s,i,a,c,l,d,p){const m=new uI(s,i,a,c,l,d);return p&&(m.gc=!0),m})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}terminate(){return _(this,null,function*(){var e,t;yield(function(s){return _(this,null,function*(){const i=H(s);O(gt,"RemoteStore shutting down."),i.la.add(5),yield vs(i),i.ha.shutdown(),i.Ta.set("Unknown")})})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()})}}aa.provider={build:()=>new aa};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const on="FirestoreClient";class AI{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Ve.UNAUTHENTICATED,this.clientId=Ia.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(a=>_(this,null,function*(){O(on,"Received user=",a.uid),yield this.authCredentialListener(a),this.user=a}))),this.appCheckCredentials.start(r,(a=>(O(on,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ht;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((()=>_(this,null,function*(){try{this._onlineComponents&&(yield this._onlineComponents.terminate()),this._offlineComponents&&(yield this._offlineComponents.terminate()),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=ic(t,"Failed to shutdown persistence");e.reject(r)}}))),e.promise}}function Uo(n,e){return _(this,null,function*(){n.asyncQueue.verifyOperationInProgress(),O(on,"Initializing OfflineComponentProvider");const t=n.configuration;yield e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((s=>_(null,null,function*(){r.isEqual(s)||(yield rf(e.localStore,s),r=s)}))),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e})}function Cl(n,e){return _(this,null,function*(){n.asyncQueue.verifyOperationInProgress();const t=yield RI(n);O(on,"Initializing OnlineComponentProvider"),yield e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>vl(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>vl(e.remoteStore,s))),n._onlineComponents=e})}function RI(n){return _(this,null,function*(){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){O(on,"Using user provided OfflineComponentProvider");try{yield Uo(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===N.FAILED_PRECONDITION||s.code===N.UNIMPLEMENTED:!(typeof DOMException!="undefined"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;st("Error using user provided cache. Falling back to memory cache: "+t),yield Uo(n,new Pi)}}else O(on,"Using default OfflineComponentProvider"),yield Uo(n,new vI(void 0));return n._offlineComponents})}function Af(n){return _(this,null,function*(){return n._onlineComponents||(n._uninitializedComponentsProvider?(O(on,"Using user provided OnlineComponentProvider"),yield Cl(n,n._uninitializedComponentsProvider._online)):(O(on,"Using default OnlineComponentProvider"),yield Cl(n,new aa))),n._onlineComponents})}function PI(n){return Af(n).then((e=>e.syncEngine))}function ca(n){return _(this,null,function*(){const e=yield Af(n),t=e.eventManager;return t.onListen=lI.bind(null,e.syncEngine),t.onUnlisten=fI.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=hI.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=pI.bind(null,e.syncEngine),t})}function SI(n,e,t,r){const s=new df(r),i=new mf(e,s,t);return n.asyncQueue.enqueueAndForget((()=>_(null,null,function*(){return ff(yield ca(n),i)}))),()=>{s.Va(),n.asyncQueue.enqueueAndForget((()=>_(null,null,function*(){return pf(yield ca(n),i)})))}}function Rf(n,e,t={}){const r=new Ht;return n.asyncQueue.enqueueAndForget((()=>_(null,null,function*(){return(function(i,a,c,l,d){const p=new df({next:w=>{p.Va(),a.enqueueAndForget((()=>pf(i,m)));const V=w.docs.has(c);!V&&w.fromCache?d.reject(new L(N.UNAVAILABLE,"Failed to get document because the client is offline.")):V&&w.fromCache&&l&&l.source==="server"?d.reject(new L(N.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(w)},error:w=>d.reject(w)}),m=new mf(Bi(c.path),p,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return ff(i,m)})(yield ca(n),n.asyncQueue,e,t,r)}))),r.promise}function VI(n,e){const t=new Ht;return n.asyncQueue.enqueueAndForget((()=>_(null,null,function*(){return mI(yield PI(n),e,t)}))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Pf=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new CI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e,t;return(t=(e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)!=null?t:void 0}get(e){if(this._document){const t=this._document.data.field(Zn("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},CI=class extends Pf{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bI{convertValue(e,t="none"){switch(me(e)){case 0:return null;case 1:return e.booleanValue;case 2:return oe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Xt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw $(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return cn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[Yr].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>oe(a.doubleValue)));return new $e(t)}convertGeoPoint(e){return new ft(oe(e.latitude),oe(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=_s(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Qn(e));default:return null}}convertTimestamp(e){const t=Jt(e);return new te(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ee.fromString(e);F(Td(r),9688,{name:e});const s=new Kr(r.get(1),r.get(3)),i=new B(r.popFirst(5));return s.isEqual(t)||Pt(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sf(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bl="AsyncQueue";class Nl{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new Rd(this,"async_queue_retry"),this.Hc=()=>{const r=Mo();r&&O(bl,"Visibility state changed to "+r.visibilityState),this.Ht.$t()},this.Jc=e;const t=Mo();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=Mo();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise((()=>{}));const t=new Ht;return this.Zc((()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.$c.push(e),this.Xc())))}Xc(){return _(this,null,function*(){if(this.$c.length!==0){try{yield this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(e){if(!or(e))throw e;O(bl,"Operation failed with retryable error: "+e)}this.$c.length>0&&this.Ht.kt((()=>this.Xc()))}})}Zc(e){const t=this.Jc.then((()=>(this.Gc=!0,e().catch((r=>{throw this.Wc=r,this.Gc=!1,Pt("INTERNAL UNHANDLED ERROR: ",kl(r)),r})).then((r=>(this.Gc=!1,r))))));return this.Jc=t,t}enqueueAfterDelay(e,t,r){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const s=sc.createAndSchedule(this,e,t,r,(i=>this.el(i)));return this.Qc.push(s),s}Yc(){this.Wc&&$(47125,{tl:kl(this.Wc)})}verifyOperationInProgress(){}nl(){return _(this,null,function*(){let e;do e=this.Jc,yield e;while(e!==this.Jc)})}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then((()=>{this.Qc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Qc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.nl()}))}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function kl(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class an extends Hi{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Nl,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}_terminate(){return _(this,null,function*(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Nl(e),this._firestoreClient=void 0,yield e}})}}function tv(n,e,t){const r=Vi(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(Qt(i,e))return s;throw new L(N.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new L(N.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Vd)throw new L(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&tr(e.host)&&la(e.host),r.initialize({options:e,instanceIdentifier:t})}function nv(n,e){const t=typeof n=="object"?n:jl(),r=typeof n=="string"?n:e,s=Vi(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=wp("firestore");i&&SE(s,...i)}return s}function no(n){if(n._terminated)throw new L(N.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||NI(n),n._firestoreClient}function NI(n){var r,s,i,a;const e=n._freezeSettings(),t=EE(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new AI(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(l){const d=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(d),_online:d}})(n._componentsProvider))}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf extends bI{constructor(e){super(),this.firestore=e}convertBytes(e){return new Xe(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}class Or{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class An extends Pf{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new si(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Zn("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new L(N.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=An._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}An._jsonSchemaVersion="firestore/documentSnapshot/1.0",An._jsonSchema={type:he("string",An._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class si extends An{data(e={}){return super.data(e)}}class zn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Or(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new si(this._firestore,this._userDataWriter,r.key,r,new Or(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new L(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((c=>{Te(s._snapshot.query)?na(s._snapshot.query):Va(s.query._query);const l=new si(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Or(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const l=new si(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Or(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,p=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),p=a.indexOf(c.doc.key)),{type:kI(c.type),doc:l,oldIndex:d,newIndex:p}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new L(N.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=zn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ia.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function kI(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return $(61501,{type:n})}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */zn._jsonSchemaVersion="firestore/querySnapshot/1.0",zn._jsonSchema={type:he("string",zn._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new L(N.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dl(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rv(n){n=Ye(n,ae);const e=Ye(n.firestore,an),t=no(e);return Rf(t,n._key).then((r=>lc(e,n,r)))}function sv(n){n=Ye(n,ae);const e=Ye(n.firestore,an),t=no(e);return Rf(t,n._key,{source:"server"}).then((r=>lc(e,n,r)))}function iv(n,e,t){n=Ye(n,ae);const r=Ye(n.firestore,an),s=Sf(n.converter,e,t),i=xa(r);return uc(r,[kd(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,rt.none())])}function ov(n,e,t,...r){n=Ye(n,ae);const s=Ye(n.firestore,an),i=xa(s);let a;return a=typeof(e=fe(e))=="string"||e instanceof ji?DE(i,"updateDoc",n._key,e,t,r):kE(i,"updateDoc",n._key,e),uc(s,[a.toMutation(n._key,rt.exists(!0))])}function av(n,e){const t=Ye(n.firestore,an),r=VE(n),s=Sf(n.converter,e),i=xa(n.firestore);return uc(t,[kd(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,rt.exists(!1))]).then((()=>r))}function cv(n,...e){var d,p,m;n=fe(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Dl(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Dl(e[r])){const w=e[r];e[r]=(d=w.next)==null?void 0:d.bind(w),e[r+1]=(p=w.error)==null?void 0:p.bind(w),e[r+2]=(m=w.complete)==null?void 0:m.bind(w)}let i,a,c;if(n instanceof ae)a=Ye(n.firestore,an),c=Bi(n._key.path),i={next:w=>{e[r]&&e[r](lc(a,n,w))},error:e[r+1],complete:e[r+2]};else{const w=Ye(n,Wi);a=Ye(w.firestore,an),c=w._query;const V=new Vf(a);i={next:k=>{e[r]&&e[r](new zn(a,V,w,k))},error:e[r+1],complete:e[r+2]},DI(n._query)}const l=no(a);return SI(l,c,s,i)}function uc(n,e){const t=no(n);return VI(t,e)}function lc(n,e,t){const r=t.docs.get(e._key),s=new Vf(n);return new An(n,s,e._key,r,new Or(t.hasPendingWrites,t.fromCache),e.converter)}const xl="@firebase/firestore",Ol="4.17.2";(function(e,t=!0){q_(nr),Hn(new Rn("firestore",((r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new an(new sE(r.getProvider("auth-internal")),new aE(a,r.getProvider("app-check-internal")),J_(a,s),a);return i=G({useFetchStreams:t},i),c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),jt(xl,Ol,e),jt(xl,Ol,"esm2020")})();var xI="firebase",OI="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */jt(xI,OI,"app");export{Ft as G,jl as a,KI as b,tv as c,nv as d,sv as e,VE as f,UI as g,GI as h,Rm as i,zI as j,rv as k,iv as l,cv as m,HI as n,jI as o,WI as p,av as q,XI as r,QI as s,$I as t,ov as u,FI as v,qI as w,BI as x};
