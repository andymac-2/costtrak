(function(){var f,aa="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},ba;if("function"==typeof Object.setPrototypeOf)ba=Object.setPrototypeOf;else{var ca;a:{var da={na:!0},ea={};try{ea.__proto__=da;ca=ea.na;break a}catch(a){}ca=!1}ba=ca?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var fa=ba;
function ha(a,b){a.prototype=aa(b.prototype);a.prototype.constructor=a;if(fa)fa(a,b);else for(var c in b)if("prototype"!=c)if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.oa=b.prototype}
var ia="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},ja="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function g(a,b){if(b){var c=ja;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ia(c,a,{configurable:!0,writable:!0,value:b})}}g("Number.MAX_SAFE_INTEGER",function(){return 9007199254740991});
g("Number.MIN_SAFE_INTEGER",function(){return-9007199254740991});g("Math.log2",function(a){return a?a:function(a){return Math.log(a)/Math.LN2}});g("Math.sign",function(a){return a?a:function(a){a=Number(a);return 0===a||isNaN(a)?a:0<a?1:-1}});window.onload=function(){new k};function l(a){a=Error.call(this,"Invalid file: "+a);this.message=a.message;"stack"in a&&(this.stack=a.stack);this.name="FileValidationError"}ha(l,Error);function m(a){a=Error.call(this,a);this.message=a.message;"stack"in a&&(this.stack=a.stack);this.name="CircularDependencyError"}ha(m,Error);function ka(a){a.forEach(function(a){return a.A=!1});for(var b=a.filter(function(a){return la(a)}).map(function(a){a.A=!0;return a}),c=0;c<b.length;c++)b[c].A=!0,b[c].J.forEach(function(a){a=a.u;la(a)&&!1===a.A&&(a.A=!0,b.push(a))});if(a.some(function(a){return!1===a.A}))throw new m("Circular dependency detected.");return b}
function ma(a){a.forEach(function(a){return a.A=!1});for(var b=a.filter(function(a){return na(a)}).map(function(a){a.A=!0;return a}),c=0;c<b.length;c++)b[c].A=!0,b[c].H.forEach(function(a){a=a.s;na(a)&&!1===a.A&&(a.A=!0,b.push(a))});if(a.some(function(a){return!1===a.A}))throw new m("Circular dependency detected.");return b}function la(a){return a.H.every(function(a){return!oa(a)||0===a.O||a.s.A})}function na(a){return a.J.every(function(a){return!pa(a)||0===a.P||a.u.A})}
function qa(a){a=ka(a);a.forEach(function(a){a.value=Number.MIN_SAFE_INTEGER;a.H.forEach(function(b){oa(b)&&(a.value=Math.max(a.value,b.s.o()))})});a.sort(n)}function ra(a){a=ma(a);a.forEach(function(a){a.value=Number.MAX_SAFE_INTEGER;a.J.forEach(function(b){pa(b)&&(a.value=Math.min(a.value,b.u.B()-a.g))})});a.sort(n)};function sa(){this.c=ta;this.a=[]}sa.prototype.add=function(a){this.a.push(a)};function ua(a){if(0===a.a.length)return null;for(var b=a.a[0],c=0;c<a.a.length;c++)0<a.c(a.a[c],b)&&(b=a.a[c]);return b}function va(a){var b=ua(a);a.a[a.a.indexOf(b)]=a.a[a.a.length-1];a.a.pop();return b};function k(){var a=document.getElementById("app");this.i=p("div",{"class":"trakMapContainer"},a);this.parent=a;this.a()}k.prototype.g=function(){var a=JSON.stringify(wa(this.b),null,"\t"),b=this.b.title+".json",c=this.i,d=q("a",{style:"display:none;"},c);d.href=URL.createObjectURL(new Blob([a],{type:"application/json"}));d.download=b;d.click();c.removeChild(d)};function xa(a,b){r(a.b,function(){var c=JSON.parse(b);ya(a.b,c)})}
function Aa(a){a.i.innerHTML="";var b=p("div",{"class":"menubar"},a.i),c=u("File",b);v([{icon:"icons/new.svg",action:a.a.bind(a)},{icon:"icons/open.svg",action:a.m.bind(a)},{icon:"icons/save.svg",action:a.g.bind(a)}],c.body);c=u("Group",b);v([{icon:"icons/plus.svg",action:function(){var b=a.b,c=new w(b,b.c.length,Ba);b.c.push(c);x(b);return c}}],c.body);c=u("Mode",b);v([{icon:"icons/arrow-two-left-right.svg",action:function(){var b=a.b;b.mode===y?Ca(b,z):b.mode===z&&Ca(b,y)}}],c.body);c=u("Print",
b);v([{icon:"icons/print.svg",action:a.c.bind(a)}],c.body);b=u("About",b);v([{icon:"icons/info.svg",action:function(){return alert('TrakMap, Version: 1.1.0\u03b2\n\nFor help and support, please visit:\n\nhttps://andymac-2.github.io/trakmap/instructions\n\n\n\nCopyright 2018 Andrew Pritchard\n\nLicensed under the Apache License, Version 2.0 (the "License");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an "AS IS" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n')}},
{icon:"icons/question.svg",action:function(){return window.open("https://andymac-2.github.io/trakmap/instructions")}}],b.body);q("div",{"class":"menuBarPlaceholder"},a.i);x(a.b);a.i.appendChild(a.b.i)}k.prototype.a=function(){this.b=new A(Da);Aa(this)};k.prototype.m=function(){var a=this;Ea(this.i,function(b){return xa(a,b)})};
k.prototype.c=function(){var a=new A(wa(this.b));x(a);this.parent.innerHTML=a.i.outerHTML;this.parent.children[0].setAttribute("class","trakMapPage");window.print();this.parent.innerHTML="";this.parent.appendChild(this.i)};function Fa(a){this.i=a;this.F=[];this.a=[];a.addEventListener("click",this.click.bind(this),!0)}Fa.prototype.click=function(a){for(var b=0;b<this.F.length;b++)for(;this.F[b]&&(!this.i.contains(this.F[b].i)||!this.F[b].i.contains(a.target));)this.F[b].event(),this.F[b]=this.F[this.F.length-1],this.F.pop();for(b=0;b<this.a.length;b++)this.a[b].i.parentNode.contains(a.target)||this.a[b].event()};function B(a,b){a[a.indexOf(b)]=a[a.length-1];a.pop()}function C(a,b){for(b=b.index;b<a.length-1;b++)a[b]=a[b+1],a[b].index=b;a.pop()}function Ga(a,b,c){var d=a[b];a[b]=a[c];a[c]=d;a[b].index=b;a[c].index=c}function D(a){return(new Date(a)).toISOString().slice(0,10)}
function Ea(a,b){var c=q("input",{type:"file",style:"display:none;",accept:".json"},a),d=new FileReader;d.onload=function(){b(d.result);a.contains(c)&&a.removeChild(c)};c.addEventListener("change",function(){d.readAsText(c.files[0])});c.click()}function E(a){return 97<a.length?a.slice(0,97)+"...":a}D=function(a){return a.toISOString().slice(0,10)};function Ha(a){a=new Date(a);return Math.floor((a.valueOf()-6E4*a.getTimezoneOffset())/864E5)};function w(a,b,c){this.b=a;this.index=b;this.g=[];this.v=[];this.a=Number.MAX_SAFE_INTEGER;this.c=Number.MIN_SAFE_INTEGER;this.m=0;this.name=c.name.toString();this.h=c.comment.toString();this.priority=c.priority|0;if(0>this.priority)throw new l('Product group "'+this.name+'", has an invalid priority');}var Ba={name:"Untitled",comment:"",priority:0};w.prototype.I=function(){return{name:this.name,comment:this.h,priority:this.priority}};w.prototype.toJSON=w.prototype.I;
function Ia(a,b){b=F("g",{"class":"productDesc"},b);var c=a.m+a.a*G-50,d=a.m+a.c*G+50,e=a.b.v+100;Ja(new Ka({l:a.b.l,K:function(b){var c=a.priority;a.name=b.title;a.h=b.h;a.priority=b.priority;try{x(a.b)}catch(za){if(za instanceof m)a.priority=c,x(a.b),alert("Error: Circular dependency");else throw za;}},w:{"class":"productDescData",transform:"translate(-45, "+c+")"}},a.name,a.h,a.priority),b);F("rect",{width:e,height:d-c,x:-50,y:c,"class":"priorityGroupBox"},b);H(I,a.b.l,[{icon:"icons/delete.svg",
action:function(){return La(a.b,a)}},{icon:"icons/move-up.svg",action:function(){0!==a.index&&(Ga(a.b.c,a.index,a.index-1),x(a.b))}},{icon:"icons/move-down.svg",action:function(){a.index!==a.b.c.length-1&&(Ga(a.b.c,a.index,a.index+1),x(a.b))}},{icon:"icons/plus.svg",action:function(){Ma(a.b,a.index,Ha(Date.now()),0);x(a.b)}}],{transform:"translate(-50, "+(c-45)+")"},b)}w.prototype.N=function(a){this.g.push(a)};
function Na(a){var b=a.g.concat(a.v);if(0===b.length)a.a=0,a.c=0;else{var c=[];a.a=Number.MAX_SAFE_INTEGER;a.c=Number.MIN_SAFE_INTEGER;a.b.mode===y&&b.sort(n).forEach(function(b){for(;Oa(c,b);)b.level+=b.direction;c[b.level]=b.o();a.a=Math.min(b.level,a.a);a.c=Math.max(b.level,a.c)});a.b.mode===z&&b.sort(Pa).forEach(function(b){for(;Qa(c,b);)b.level+=b.direction;c[b.level]=b.B();a.a=Math.min(b.level,a.a);a.c=Math.max(b.level,a.c)})}}
function Oa(a,b){if(void 0===a[b.level])return!1;if(0<b.D())return b.B()<a[b.level];if(0===b.D())return b.B()<=a[b.level]}function Qa(a,b){if(void 0===a[b.level])return!1;if(0<b.D())return b.o()>a[b.level];if(0===b.D())return b.o()>=a[b.level]}w.prototype.G=function(){var a=this;this.g.slice().forEach(function(b){C(a.b.a,b);b.G()});this.v.slice().forEach(function(b){C(a.b.g,b);b.G()})};function J(a,b,c){this.J=[];this.H=[];this.name=this.h="";this.level=0;this.direction=K;this.g=0;this.start={x:0,y:0};this.m={x:0,y:0};this.index=b;this.b=a;this.v=new L(this.b,this);this.name=c.name.toString();this.h=c.comment.toString()||"";this.level=c.level|0;this.g=c.weight|7;if(1>=this.g)throw new l('Product "'+this.name+'" has an invalid weight. Weight must be positive');this.c=c.health||1;2!==this.c&&3!==this.c&&(this.c=1);this.a=c.percent||0;this.a=Math.max(0,this.a);this.a=Math.min(1,this.a);
this.j=this.b.c[c.priorityGroup];if(!this.j)throw new l('Product "'+this.name+'" has an invalid product group index.');this.j.N(this)}var K=-1;function n(a,b){var c=a.value-b.value;return 0!==c?c:a.D()-b.D()}function Pa(a,b){var c=b.o()-a.o();return 0!==c?c:a.D()-b.D()}function ta(a,b){var c=b.o()-a.o();return 0!==c?c:a.S()-b.S()}f=J.prototype;f.ha=function(){return{name:this.name,comment:this.h,level:this.level,weight:this.g,health:this.c,percent:this.a,priorityGroup:this.j.index}};f.toJSON=J.prototype.ha;
function Ra(a,b){b=F("g",{"class":"product"},b);b.addEventListener("click",function(){a.b.select(M,a)});var c=a.T(),d=a.R();F("line",{"class":N(a),x1:c.x,y1:c.y,x2:d.x,y2:d.y},b);d=(c.x+d.x)/2;Sa(new Ta({l:a.b.l,K:function(b){return Ua(a,b)},w:{"class":"productData",transform:"translate("+d+", "+c.y+")"},product:a},a.name,a.g,a.h,a.j),b);H(O,a.b.l,[{icon:"icons/arrow-left.svg",action:function(){return a.b.select(Va,a)}},{icon:"icons/delete.svg",action:function(){return Wa(a.b,a)}},{icon:"icons/move-up.svg",
action:function(){return a.ga()}},{icon:"icons/move-down.svg",action:function(){return a.fa()}},{icon:"icons/arrow-right.svg",action:function(){return a.b.select(Xa,a)}}],{transform:"translate("+d+", "+(c.y-45)+")"},b)}function Ya(a){return a.H.some(function(b){return b.s.C()<=a.C()})}function Za(a){return a.J.some(function(b){return b.u.C()<=a.C()})}f.C=function(){return this.j.priority};f.B=function(){return this.value};f.o=function(){return this.value+this.g};
f.T=function(){if(this.b.mode===y)return{x:this.start.x+P,y:this.start.y};if(this.b.mode===z)return this.start};f.R=function(){if(this.b.mode===z)return{x:this.m.x-P,y:this.m.y};if(this.b.mode===y)return this.m};f.D=function(){return $a+50*Math.log2(Math.abs(-this.g))};f.S=function(){return this.start.x+this.D()};function Q(a){if(1===a.a)return"complete";switch(a.c){case 1:return"on-track";case 2:return"at-risk";case 3:return"late"}}
function N(a){return 1===a.a?"priorityLine complete":"priorityLine priority-"+a.C()}f.ca=function(a){this.m.x=a};f.da=function(a){this.start.x=a};f.aa=function(a){B(this.H,a)};f.W=function(a){this.H.push(a)};f.ba=function(a){B(this.J,a)};f.X=function(a){this.J.push(a)};f.U=function(a){this.direction=a};f.G=function(){var a=this;this.H.slice().forEach(function(b){return R(a.b,b)});this.J.slice().forEach(function(b){return R(a.b,b)});B(this.j.g,this)};
function Ua(a,b){a.name=b.title;a.g=Math.max(Math.floor(b.L),1);a.h=b.h;r(a.b,function(){var c=b.j;c!==a.j&&(B(a.j.g,a),a.j=c,a.j.N(a))})}f.ga=function(){this.level+=K;ab(this.b,1);this.U(K);x(this.b)};f.fa=function(){this.level+=1;ab(this.b,K);this.U(1);x(this.b)};function L(a,b){this.product=b;this.b=a}
function bb(a,b){var c=a.b.mode===y?a.product.R():a.b.mode===z?a.product.T():void 0;b=F("g",{"class":"dateBubble",transform:"translate("+c.x+", "+c.y+")"},b);F("circle",{cx:"0",cy:"0",r:18,"class":"dateBubbleCircle "+Q(a.product)},b);0!==a.product.a&&cb(a.product.a*Math.PI*2,"percentArc "+N(a.product),b);a.a(b,"dateBubbleText "+Q(a.product));a.b.mode===y?H(O,a.b.l,[{icon:"icons/arrow-right.svg",action:function(){var b=db(a);S(a.b,a.product,b);x(a.b)}}],{transform:"translate(0, -40)"},b):a.b.mode===
z&&H(O,a.b.l,[{icon:"icons/arrow-left.svg",action:function(){var b=db(a);S(a.b,b,a.product);x(a.b)}}],{transform:"translate(0, -40)"},b);H(O,a.b.l,[{icon:"icons/percent.svg",action:function(){var b=a.product;b.a+=.25;1<b.a&&(b.a=0);x(b.b)}},{icon:"icons/health.svg",action:function(){var b=a.product;switch(b.c){case 1:b.c=2;break;case 2:b.c=3;break;default:b.c=1}x(b.b)}}],{transform:"translate(0, 40)"},b)}
L.prototype.a=function(a,b){var c=this.V(),d=""+c.getUTCFullYear();c="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[c.getUTCMonth()]+(""+c.getUTCDate());F("text",{x:0,y:-3,"text-anchor":"middle","class":b},a).textContent=d;F("text",{x:0,y:7,"text-anchor":"middle","class":b},a).textContent=c};L.prototype.$=function(){if(this.b.mode===y)return this.product.o();if(this.b.mode===z)return this.product.B()};L.prototype.V=function(){return new Date(864E5*this.$())};
function db(a){return a.b.N({name:"New Product",comment:"",weight:7,priorityGroup:a.product.j.index,level:a.product.level,health:1,percent:0})};function T(a,b,c){this.H=[];this.J=[];this.b=a;this.index=b;this.direction=K;this.a={x:0,y:0};this.value=c.value|0;this.level=c.level|0;this.j=this.b.c[c.priorityGroup];if(!this.j)throw new l("Milestone has invalid product group index");this.j.v.push(this)}var eb={priorityGroup:0,value:Ha(Date.now()),level:0};f=T.prototype;f.ea=function(){return{level:this.level,value:this.value,priorityGroup:this.j.index}};f.toJSON=T.prototype.ea;
function fb(a,b){b=F("g",{"class":"milestone",transform:"translate("+a.a.x+", "+a.a.y+")"},b);b.addEventListener("click",function(){a.b.select(M,a)});F("path",{d:"M -21 0L 0 21L 21 0L 0 -21 Z"},b);a.ja(b,"milestoneDate");a.b.mode===y?H(O,a.b.l,[{icon:"icons/arrow-right.svg",action:function(){var b=gb(a);S(a.b,a,b);x(a.b)}},{icon:"icons/delete.svg",action:function(){return hb(a.b,a)}}],{transform:"translate(0, -40)"},b):a.b.mode===z&&H(O,a.b.l,[{icon:"icons/arrow-left.svg",action:function(){var b=
gb(a);S(a.b,b,a);x(a.b)}},{icon:"icons/delete.svg",action:function(){return hb(a.b,a)}}],{transform:"translate(0, -40)"},b);new U({Y:O,l:a.b.l,onchange:function(b,d){a.value=d.Z;x(a.b)},parent:b,w:{transform:"translate(0, 3)"}},a.$());H(O,a.b.l,[{icon:"icons/move-up.svg",action:function(){return a.la()}},{icon:"icons/move-down.svg",action:function(){return a.ka()}}],{transform:"translate(0, 40)"},b)}f.ja=L.prototype.a;f.V=L.prototype.V;f.$=function(){return this.value};f.o=function(){return this.value};
f.B=function(){return this.value};f.T=function(){return this.a};f.R=function(){return this.a};f.D=function(){return 0};f.S=function(){return this.a.x};f.C=function(){return this.j.priority};f.ba=J.prototype.ba;f.aa=J.prototype.aa;f.X=J.prototype.X;f.W=J.prototype.W;f.ma=J.prototype.U;f.la=J.prototype.ga;f.ka=J.prototype.fa;f.da=function(a){this.a.x=a};f.ca=T.prototype.da;
f.G=function(){var a=this;this.H.slice().forEach(function(b){return R(a.b,b)});this.J.slice().forEach(function(b){return R(a.b,b)});B(this.j.v,this)};function gb(a){return a.b.N({name:"New Product",comment:"",weight:7,priorityGroup:a.j.index,level:a.level})};function ib(a){a=Error.call(this,a);this.message=a.message;"stack"in a&&(this.stack=a.stack);this.name="HangingDependencyError"}ha(ib,Error);
function V(a,b,c){this.b=a;this.index=b;this.O=c.dependencyType?1:0;1===this.O?this.s=this.b.a[c.dependency]:0===this.O&&(this.s=this.b.g[c.dependency]);if(!this.s)throw new l("Dependency has invalid dependency index");this.s.X(this);this.P=c.dependentType?1:0;1===this.P?this.u=this.b.a[c.dependent]:0===this.P&&(this.u=this.b.g[c.dependent]);if(!this.u)throw new l("Dependency has invalid dependent index");this.u.W(this)}
function jb(a,b){b=F("g",{"class":"dependency"},b);b.addEventListener("dblclick",function(){return kb(a.b,a)});var c=a.s.o()!==a.u.B()?!1:a.b.mode===y?oa(a):a.b.mode===z?pa(a):void 0;c?(c=a.b.mode===y?N(a.u):a.b.mode===z?N(a.s):void 0,lb(a.u.T(),a.s.R(),c,b)):mb(a.s.R(),a.u.T(),b);return b}V.prototype.a=function(){return{dependencyType:this.O,dependency:this.s.index,dependentType:this.P,dependent:this.u.index}};V.prototype.toJSON=V.prototype.a;function oa(a){return 0===a.P?!1:a.s.C()<=a.u.C()}
function pa(a){return 0===a.O?!1:a.u.C()<=a.s.C()}V.prototype.G=function(){this.s.ba(this);this.u.aa(this)};function A(a){this.i=F("svg",{});this.ia=this.v=0;this.a=[];this.g=[];this.I=[];this.c=[];this.l=new Fa(this.i);ya(this,a)}var P=44,$a=250,G=70,z=0,y=1,Da={title:"New TrakMap",products:[{name:"New Product",comment:"",weight:7,priorityGroup:0,level:0,health:1,percent:0}],milestones:[eb],dependencies:[{dependencyType:0,dependency:0,dependentType:1,dependent:0}],mode:y,priorityGroups:[Ba]};
function wa(a){return{title:a.title,mode:a.mode,priorityGroups:a.c,products:a.a.map(function(a){return a.ha()}),milestones:a.g.map(function(a){return a.ea()}),dependencies:a.I.map(function(a){return a.a()})}}
function ya(a,b){a.title=b.title.toString()||"Untitled";a.mode=b.mode;if(a.mode!==y&&a.mode!==z)throw new l("Invalid TrakMap mode.");a.c=[];b.priorityGroups.forEach(function(b,d){a.c.push(new w(a,d,b))});a.g=[];b.milestones.forEach(function(b,d){a.g.push(new T(a,d,b))});a.a=[];b.products.forEach(function(b,d){a.a.push(new J(a,d,b))});a.I=[];b.dependencies.forEach(function(b,d){a.I.push(new V(a,d,b))});a.m=null;a.M=nb}
function x(a){ob(a);var b=Math.max(a.v+80,700)- -80,c=a.ia- -80,d=(Math.max(a.v+80,700)+-80)/2;a.i.setAttribute("width",""+b);a.i.setAttribute("viewBox","-80 -80 "+b+" "+c+" ");a.i.innerHTML="";b=F("g",{},a.i);new W(a.title,a.l,function(b,c){a.title=c.text},{"class":"trakMapTitle",transform:"translate("+d+" -40)"},b);var e=F("g",{"class":"TMConnections"},a.i),h=F("g",{"class":"TMProducts"},a.i),t=F("g",{"class":"TMBubbles"},a.i);a.a.forEach(function(a){Ra(a,h);bb(a.v,t)});a.g.forEach(function(a){return fb(a,
t)});a.I.forEach(function(a){return jb(a,e)});a.c.forEach(function(a){Ia(a,h)})}function ob(a){a.mode===y&&pb(a);a.mode===z&&qb(a);rb(a);sb(a);tb(a);ub(a)}
function ub(a){var b=new sa,c=0;a.v=0;var d=a.a.concat(a.g).sort(n),e=d[0].B();for(d.forEach(function(d){for(;0<b.a.length&&ua(b).o()<=d.B();){var h=ua(b);if(e!==h.o()){var t=e;e=h.o();c+=P+50*Math.log2(Math.abs(e-t));c=Math.max(c,h.S())}a.v=Math.max(a.v,c);h.ca(c);va(b)}e!==d.B()&&(h=e,e=d.B(),c+=P+50*Math.log2(Math.abs(e-h)));d.da(c);b.add(d)});d=va(b);){if(e!==d.o()){var h=e;e=d.o();c+=P+50*Math.log2(Math.abs(e-h));c=Math.max(c,d.S())}a.v=Math.max(a.v,c);d.ca(c)}}
function qb(a){a.a.forEach(function(a){if(!Za(a))throw new ib('Product "'+a.name+'" has no dependents in lazy mode.');});ra(a.a)}function pb(a){a.a.forEach(function(a){if(!Ya(a))throw new ib('Product "'+a.name+'" has no dependencies in greedy mode.');});qa(a.a)}function sb(a){var b=50;a.c.forEach(function(a){a.m=b-a.a*G;b+=G*(a.c-a.a)+130});a.ia=b}function rb(a){a.c.forEach(function(a){Na(a)})}
function tb(a){a.a.forEach(function(a){a.start.y=a.m.y=a.level*G+a.j.m});a.g.forEach(function(a){a.a.y=a.level*G+a.j.m})}function vb(a,b,c){var d=a.c.map(function(a){return a.name});wb(function(c){b(a.c[c.currentTarget.value])},d,c)}A.prototype.N=function(a){a=new J(this,this.a.length,a);this.a.push(a);return a};function Ma(a,b,c,d){b=new T(a,a.g.length,{priorityGroup:b,value:c,level:d});a.g.push(b);return b}
function S(a,b,c){b=new V(a,a.I.length,{dependencyType:b instanceof J?1:0,dependency:b.index,dependentType:c instanceof J?1:0,dependent:c.index});a.I.push(b);return b}function ab(a,b){a.a.forEach(function(a){return a.U(b)});a.g.forEach(function(a){return a.ma(b)})}function R(a,b){C(a.I,b);b.G()}function r(a,b){var c=wa(a);try{b(),x(a)}catch(d){ya(a,c),x(a),alert(d.name+": "+d.message)}}function kb(a,b){r(a,function(){return R(a,b)})}function Wa(a,b){r(a,function(){C(a.a,b);b.G()})}
function La(a,b){r(a,function(){C(a.c,b);b.G()})}function hb(a,b){r(a,function(){C(a.g,b);b.G()})}function Ca(a,b){r(a,function(){return xb(a,b)})}function xb(a,b){a.mode=b;a.mode===y&&a.a.forEach(function(b){if(!Ya(b)){var c=Ma(a,b.j.index,b.B(),b.level);S(a,c,b)}});a.mode===z&&a.a.forEach(function(b){if(!Za(b)){var c=Ma(a,b.j.index,b.o(),b.level);S(a,b,c)}})}var Xa=0,Va=1,M=2,nb=3;
A.prototype.select=function(a,b){var c=this;b===this.m&&a>=this.M||(a===M&&this.M===Xa&&b!==this.m?(r(this,function(){return S(c,c.m,b)}),this.m=null,this.M=nb):a===M&&this.M===Va&&b!==this.m?(r(this,function(){return S(c,b,c.m)}),this.m=null,this.M=nb):(this.m=b,this.M=a))};function Ta(a,b,c,d,e){this.l=a.l;this.K=a.K||function(){};this.w=a.w||{};this.product=a.product;this.a=!1;X(this,b,c,d,e)}function X(a,b,c,d,e){a.title=b;a.title=""===a.title?"Untitled":a.title;a.L=c;a.h=d;a.h=""===a.h?"":a.h;a.j=e}function Sa(a,b){Y(a.g.bind(a),a.c.bind(a),a.l,a.w,b)}
Ta.prototype.c=function(a){var b=this;a.innerHTML="";var c=F("foreignObject",{"class":"flex-container",width:180,height:45,x:-90,y:-25},a);c=p("div",{"class":"flex-container"},c);var d=p("input",{"class":"productName "+Q(this.product),value:this.title,type:"text",placeholder:"Product Name"},c);d.addEventListener("change",function(){X(b,d.value,b.L,b.h,b.j);b.a=!0});var e=p("input",{"class":"productWeight",value:this.L,type:"number",required:""},c);e.addEventListener("change",function(){X(b,b.title,
e.value|0,b.h,b.j);b.a=!0});c=F("foreignObject",{width:180,height:45,x:-90,y:5},a);c=p("div",{"class":"flex-container"},c);var h=p("input",{"class":"productComment comment",value:this.h,type:"text",placeholder:"Product Comment"},c);h.addEventListener("change",function(){X(b,b.title,b.L,h.value,b.j);b.a=!0});vb(this.product.b,function(a){X(b,b.title,b.L,b.h,a);b.a=!0},c)};
Ta.prototype.g=function(a){this.a&&(this.K(this),this.a=!1);a.innerHTML="";var b=" ("+this.L+")";F("text",{"text-anchor":"middle",transform:"translate(0, -10)","class":"productName "+Q(this.product)},a).textContent=E(this.title+b);F("text",{"class":"productComment comment","text-anchor":"middle",transform:"translate(0, 15)"},a).textContent=E(this.h)};function Ka(a,b,c,d){this.l=a.l;this.K=a.K||function(){};this.w=a.w||{};this.a=!1;Z(this,b,c,d)}function Z(a,b,c,d){a.title=b;a.title=""===a.title?"Untitled":a.title;a.h=c;a.h=""===a.h?"":a.h;a.priority=d}function Ja(a,b){Y(a.g.bind(a),a.c.bind(a),a.l,a.w,b)}
Ka.prototype.c=function(a){var b=this;a.innerHTML="";var c=F("foreignObject",{width:315,height:45,x:0,y:-25},a),d=p("input",{"class":"priorityGroupTitle",value:this.title,type:"text",placeholder:"Product Group Name"},c);d.addEventListener("change",function(){Z(b,d.value,b.h,b.priority);b.a=!0});var e=p("input",{"class":"numberBox",value:this.priority,type:"number",required:""},c);e.addEventListener("change",function(){Z(b,b.title,b.h,e.value|0);b.a=!0});c=F("foreignObject",{width:315,height:45,x:0,
y:5},a);var h=p("input",{"class":"svgCommentBox comment",value:this.h,type:"text",placeholder:"Product Group Comment"},c);h.addEventListener("change",function(){Z(b,b.title,h.value,b.priority);b.a=!0})};
Ka.prototype.g=function(a){this.a&&(this.K(this),this.a=!1);a.innerHTML="";F("text",{"text-anchor":"start",transform:"translate(0, -10)"},a).textContent=E("Priority "+this.priority+": "+this.title);F("text",{"class":"priorityGroupComment comment","text-anchor":"start",transform:"translate(0, 15)"},a).textContent=E(this.h)};var O=0,I=1;function lb(a,b,c,d){c=F("g",{"class":c},d);F("line",{x1:b.x,y1:b.y,x2:a.x,y2:a.y},c)}function mb(a,b,c){var d=60*Math.sign(a.y-b.y);F("path",{"class":"priorityLine slack",d:"M"+a.x+" "+a.y+" C"+(a.x+100)+" "+(a.y-d)+" "+(b.x-100)+" "+(b.y+d)+" "+b.x+" "+b.y},c)}function cb(a,b,c){F("path",{"class":b,d:"M 0 -18 "+("A 18 18 0 0 1 "+18*Math.sin(a/3)+" "+-(18*Math.cos(a/3)))+("A 18 18 0 0 1 "+18*Math.sin(a/2)+" "+-(18*Math.cos(a/2)))+("A 18 18 0 0 1 "+18*Math.sin(a)+" "+-(18*Math.cos(a)))},c)};function yb(a){a=a.getCTM();return{x:a.e,y:a.f}}function Y(a,b,c,d,e){d=F("g",d,e);return zb(d,a,b,c,e)}function zb(a,b,c,d,e){function h(){b(a);e.contains(a)&&e.addEventListener("click",t)}function t(){c(a);e.removeEventListener("click",t);e.contains(a)&&d.F.push({i:e,event:h})}h();return a}document.createElement("canvas").getContext("2d");function Ab(a,b,c){c=F("g",{"class":"menu"},c);switch(a){case O:var d=45*(b.length+1)/-2;break;case I:d=-22.5;break;case 2:d=-(45*(b.length+1))}for(a=0;a<b.length;a++){d+=45;var e=F("g",{transform:"translate("+d+", 0)","class":"menuEntry"},c);e.addEventListener("click",b[a].action);F("circle",{"class":"iconCircle",r:"14"},e);F("image",{x:"-8",y:"-8",height:"16",width:"16"},e).setAttributeNS("http://www.w3.org/1999/xlink","href",b[a].icon)}return c}
function H(a,b,c,d,e){Y(function(a){return a.innerHTML=""},function(b){b.innerHTML="";Ab(a,c,b)},b,d,e)}function u(a,b){b=q("span",{"class":"menuBarSegment"},b);q("div",{"class":"menuBarHeader"},b).textContent=a;a=q("div",{"class":"menuBarContent"},b);return{i:b,body:a}}function v(a,b){b=q("span",{},b);b=F("svg",{width:45*a.length,height:40},b);Ab(I,a,b).setAttribute("transform","translate (0, 20)")}
function wb(a,b,c){var d=q("select",{"class":"productPriorityGroup"},c);d.addEventListener("change",a);q("option",{selected:"",disabled:"",hidden:""},d).textContent="Please choose:";b.forEach(function(a,b){q("option",{value:b},d).textContent=a})};function q(a,b,c){a=document.createElement(a);if(b)for(var d in b)a.setAttribute(d,b[d]);c&&c.appendChild(a);return a}function Bb(a,b,c,d){a=document.createElementNS(a,b);if(c)for(var e in c)a.setAttribute(e,c[e]);d&&d.appendChild(a);return a}var F=Bb.bind(null,"http://www.w3.org/2000/svg"),p=Bb.bind(null,"http://www.w3.org/1999/xhtml");function W(a,b,c,d,e){switch(O){case I:this.a="start";break;case O:this.a="middle"}this.l=b;this.onchange=c;this.parent=e;this.w=d;this.text=a;this.text=""===this.text?"Untitled":this.text;this.i=Y(this.g.bind(this),this.c.bind(this),this.l,this.w,this.parent)}
W.prototype.c=function(a){var b=this,c=a.getBoundingClientRect().height;a.innerHTML="";var d=20*c,e="middle"===this.a?d/-2:0,h=yb(a),t=-h.x;h=-h.y;a=F("foreignObject",{width:d,height:1.4*c,transform:"translate("+t+", "+h+")",x:e-t,y:0-c-h},a);a=q("input",{"class":"svgTextBox",type:"text",value:this.text},a);a.focus();a.select();a.addEventListener("change",this.m.bind(this,a));a.addEventListener("change",function(a){return b.onchange(a,b)})};
W.prototype.g=function(a){a.innerHTML="";F("text",{"text-anchor":this.a},a).textContent=E(this.text)};W.prototype.m=function(a){this.text=a.value;this.text=""===this.text?"Untitled":this.text};function U(a,b){this.Y=a.Y;this.l=a.l;this.onchange=a.onchange||function(){};this.parent=a.parent;this.w=a.w||{};this.min=a.min||null;this.max=a.max||null;this.Z=b;this.i=Y(this.c.bind(this),this.a.bind(this),this.l,this.w,this.parent)}
U.prototype.a=function(a){var b=this;a.innerHTML="";switch(this.Y){case I:var c=0;break;case 2:c=-105;break;case O:c=-52.5}a=F("foreignObject",{width:105,height:22.5,x:c,y:-15},a);c={"class":"svgDateBox",value:D(new Date(864E5*this.Z)),type:"date",required:""};this.min&&(c.min=D(new Date(864E5*this.min)));this.max&&(c.max=D(new Date(864E5*this.max)));a=p("input",c,a);a.addEventListener("blur",this.g.bind(this,a));a.addEventListener("blur",function(a){return b.onchange(a,b)})};
U.prototype.c=function(a){a.innerHTML=""};U.prototype.g=function(a){this.Z=Ha((new Date(a.value+"T00:00:00.000Z")).valueOf())};}).call(this);