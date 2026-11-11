import{b as D,r as t,j as n,i as mt,X as et,L as bt,B as pt,C as vt}from"./index-ca__boA_.js";var Kt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Gt(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}const xt=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],wt=D("chevron-right",xt);const gt=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],yt=D("download",gt);const kt=[["circle",{cx:"12",cy:"16",r:"1",key:"1au0dj"}],["rect",{width:"18",height:"12",x:"3",y:"10",rx:"2",key:"l0tzu3"}],["path",{d:"M7 10V7a5 5 0 0 1 9.33-2.5",key:"car5b7"}]],Et=D("lock-keyhole-open",kt);const Mt=[["circle",{cx:"12",cy:"16",r:"1",key:"1au0dj"}],["rect",{x:"3",y:"10",width:"18",height:"12",rx:"2",key:"6s8ecr"}],["path",{d:"M7 10V7a5 5 0 0 1 10 0v3",key:"1pqi11"}]],jt=D("lock-keyhole",Mt);const Nt=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]],Ct=D("maximize",Nt);const Tt=[["path",{d:"M8 3v3a2 2 0 0 1-2 2H3",key:"hohbtr"}],["path",{d:"M21 8h-3a2 2 0 0 1-2-2V3",key:"5jw1f3"}],["path",{d:"M3 16h3a2 2 0 0 1 2 2v3",key:"198tvr"}],["path",{d:"M16 21v-3a2 2 0 0 1 2-2h3",key:"ph8mxp"}]],Rt=D("minimize",Tt);const Lt=[["path",{d:"M5 12h14",key:"1ays0h"}]],Pt=D("minus",Lt);const _t=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],zt=D("plus",_t);const At=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],$t=D("rotate-cw",At),St=100,ze=72,Ae=2,tt=60,$e=`
  flex-none flex items-center justify-center
  w-[34px] h-[34px] rounded-full
  border border-[#94a3b8] bg-[#263244] text-white text-xl leading-none select-none
  hover:text-white hover:bg-[#35465d] hover:border-[#f5ce85]
  active:scale-95 transition duration-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-2)]
  disabled:opacity-50 disabled:pointer-events-none
`;function Dt({zoom:s,onZoomIn:c,onZoomOut:u,onReset:i,scrollRef:l,minZoom:h=25,maxZoom:d=300,hidden:F=!1,onActivity:E,onPan:v,onPositionChange:R,positionLocked:b=!1,onTogglePositionLock:x}){const j=t.useRef(null),[I,K]=t.useState(.5),[L,p]=t.useState(!1),[P,W]=t.useState(!1),m=t.useRef({startX:0,startPos:0}),N=t.useRef(null),M=t.useCallback(()=>{const a=l.current;if(!a)return;const f=a.scrollWidth-a.clientWidth;f>1?(p(!0),K(Math.min(1,Math.max(0,a.scrollLeft/f)))):(p(!1),K(.5))},[l]);t.useEffect(()=>{const a=l.current;if(!a)return;a.addEventListener("scroll",M,{passive:!0}),window.addEventListener("resize",M);let f;return typeof ResizeObserver<"u"&&(f=new ResizeObserver(M),f.observe(a),Array.from(a.children).forEach(_=>f?.observe(_))),()=>{a.removeEventListener("scroll",M),window.removeEventListener("resize",M),f?.disconnect()}},[l,M]),t.useEffect(()=>{const a=requestAnimationFrame(M);return()=>cancelAnimationFrame(a)},[s,M]);const y=t.useCallback(()=>{N.current!==null&&(window.clearInterval(N.current),N.current=null)},[]);t.useEffect(()=>y,[y]);const U=a=>f=>{f.preventDefault(),E?.(),y(),a(),N.current=window.setInterval(()=>{E?.(),a()},St)},z=()=>{const a=j.current;return a?a.clientWidth-ze-Ae*2:0},O=a=>{const f=l.current;if(!f||b)return;const _=Math.min(1,Math.max(0,a));v?.(),f.scrollLeft=_*Math.max(0,f.scrollWidth-f.clientWidth),R?.(_),M()},Z=a=>{b||(a.preventDefault(),a.stopPropagation(),E?.(),a.currentTarget.setPointerCapture(a.pointerId),m.current={startX:a.clientX,startPos:I},W(!0))},ke=a=>{if(!P||!L)return;const f=z();f<=0||(E?.(),O(m.current.startPos+(a.clientX-m.current.startX)/f))},Q=a=>{a.currentTarget.hasPointerCapture(a.pointerId)&&a.currentTarget.releasePointerCapture(a.pointerId),W(!1)},k=a=>{const f=l.current;if(!f||a.key!=="ArrowLeft"&&a.key!=="ArrowRight")return;const _=f.scrollWidth-f.clientWidth;_>1&&O((f.scrollLeft+(a.key==="ArrowLeft"?-tt:tt))/_),a.preventDefault(),a.stopPropagation(),E?.()},de=F&&!P;return n.jsxs("div",{role:"group","aria-label":"Controles de zoom e rolagem horizontal","aria-hidden":de,onPointerDown:E,className:`
        fixed left-1/2 z-30 -translate-x-1/2
        bottom-[calc(14px+env(safe-area-inset-bottom,0px))]
        flex items-center gap-1.5 p-1
        w-[min(94vw,400px)]
        rounded-full border border-[var(--border-2)]
        bg-[var(--bg-2)]/60 backdrop-blur-sm
        select-none transition-[opacity,transform] duration-500 ease-out
        ${de?"opacity-0 translate-y-3 pointer-events-none":"opacity-100"}
      `,children:[n.jsx("button",{type:"button",className:$e,"aria-label":"Diminuir zoom",title:"Diminuir zoom (−)",disabled:s<=h,onClick:a=>{a.detail===0&&u()},onPointerDown:U(u),onPointerUp:y,onPointerLeave:y,onPointerCancel:y,children:n.jsx(Pt,{className:"h-5 w-5",strokeWidth:2.8,"aria-hidden":"true"})}),x&&n.jsx("button",{type:"button",className:`${$e} border ${b?"!border-[#ffe0a3] !bg-[#f5ce85] !text-[#211708] hover:!text-[#211708] hover:!bg-[#ffe0a3] shadow-[0_0_12px_rgba(245,206,133,0.3)]":"!border-[#94a3b8] !bg-[#263244] !text-white hover:!text-white hover:!bg-[#35465d]"}`,"aria-label":b?"Destravar posição":"Travar posição",title:b?"Posição travada · clique para ajustar":"Travar posição horizontal","aria-pressed":b,onClick:x,children:b?n.jsx(jt,{className:"h-[18px] w-[18px]",strokeWidth:2.2,"aria-hidden":"true"}):n.jsx(Et,{className:"h-[18px] w-[18px]",strokeWidth:2.2,"aria-hidden":"true"})}),n.jsxs("div",{ref:j,className:`
          relative flex-1 h-[34px] rounded-full overflow-hidden
          bg-[var(--bg)] border border-[var(--border)]
          shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]
        `,style:{backgroundImage:"repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 14px)"},children:[n.jsx("span",{"aria-hidden":!0,className:"absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"‹"}),n.jsx("span",{"aria-hidden":!0,className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"›"}),n.jsxs("div",{role:"slider",tabIndex:0,"aria-label":"Mover a página para os lados","aria-orientation":"horizontal","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(I*100),"aria-disabled":!L||b,"aria-valuetext":L?`${b?"Travada":"Posição"} em ${Math.round(I*100)}%`:void 0,title:L?b?"Destrave a posição para ajustar":"Arraste para ajustar e use o cadeado para travar":"Aumente o zoom para rolar para os lados",onPointerDown:Z,onPointerMove:ke,onPointerUp:Q,onPointerCancel:Q,onDoubleClick:b?void 0:i,onKeyDown:k,className:`
            absolute top-[2px] h-7 flex items-center justify-center
            rounded-full border-2 bg-[var(--bg)]
            text-[13px] font-bold text-white touch-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)]
            ${L?"border-[var(--gold)]":"border-[var(--gold-dark)] opacity-60"}
            ${P?"cursor-grabbing border-[var(--gold-bright)] shadow-[0_0_14px_rgba(240,224,184,.45)]":"cursor-grab transition-[left] duration-150"}
          `,style:{width:ze,left:`calc(${Ae}px + (100% - ${ze+Ae*2}px) * ${I})`},children:[Math.round(s),"%"]})]}),n.jsx("button",{type:"button",className:$e,"aria-label":"Aumentar zoom",title:"Aumentar zoom (+)",disabled:s>=d,onClick:a=>{a.detail===0&&c()},onPointerDown:U(c),onPointerUp:y,onPointerLeave:y,onPointerCancel:y,children:n.jsx(zt,{className:"h-5 w-5",strokeWidth:2.8,"aria-hidden":"true"})})]})}const ge=25,ye=300,Se=100,we=5;function Ft({containerRef:s,viewport:c,pageWidth:u,pageHeight:i,rotation:l,enabled:h}){const{isMobile:d,isTablet:F}=c,[E,v]=t.useState(Se/100),[R,b]=t.useState("fit"),x=t.useCallback(()=>{const p=s.current;if(!p)return Se/100;const P=p.clientWidth,W=p.clientHeight;if(!P||!W)return Se/100;const m=l%180!==0,N=m?i:u,M=m?u:i,y=d?0:32,U=d?24:48,z=Math.max(P-y,200)/N,O=Math.max(W-U,200)/M,Z=d||F?z:Math.min(z,O);return Math.min(Math.max(Z,ge/100),ye/100)},[s,d,F,i,u,l]);t.useEffect(()=>{if(!h||R!=="fit")return;const p=requestAnimationFrame(()=>v(x()));return()=>cancelAnimationFrame(p)},[x,h,R,c.width,c.height,u,i,l]);const j=t.useCallback(p=>{const P=Math.max(ge,Math.min(ye,p));b("manual"),v(P/100)},[]),I=t.useCallback(()=>{b("manual"),v(p=>Math.min(ye,(Math.floor(Math.round(p*100)/we)+1)*we)/100)},[]),K=t.useCallback(()=>{b("manual"),v(p=>Math.max(ge,(Math.ceil(Math.round(p*100)/we)-1)*we)/100)},[]),L=t.useCallback(()=>{b("fit"),v(x()),window.requestAnimationFrame(()=>{s.current?.scrollTo({top:0,left:0,behavior:"smooth"})})},[x,s]);return{scale:E,zoomMode:R,zoomPercentage:`${Math.round(E*100)}%`,zoomIn:I,zoomOut:K,setManualZoom:j,fitToScreen:L}}function It(s,c,u){return Math.min(Math.max(s,c),u)}function Ot(s){const[c,u]=t.useState(!1);t.useEffect(()=>{const l=()=>{u(!!document.fullscreenElement&&document.fullscreenElement===s.current)};return document.addEventListener("fullscreenchange",l),()=>{document.removeEventListener("fullscreenchange",l)}},[s]);const i=t.useCallback(async()=>{try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen()}catch(l){console.warn("Não foi possível alternar o fullscreen.",l)}},[s]);return{isFullscreen:c,toggleFullscreen:i}}function Bt(s=!0){t.useEffect(()=>{if(!s)return;const c=document.documentElement,u=document.body.style.overflow,i=c.style.overscrollBehavior;return document.body.style.overflow="hidden",c.style.overscrollBehavior="none",()=>{document.body.style.overflow=u,c.style.overscrollBehavior=i}},[s])}function nt({idleMs:s=3200,suspended:c=!1}={}){const[u,i]=t.useState(!0),l=t.useRef(null),h=t.useCallback(()=>{l.current!==null&&(window.clearTimeout(l.current),l.current=null)},[]),d=t.useCallback(()=>{h(),!c&&(l.current=window.setTimeout(()=>{i(!1)},s))},[h,s,c]),F=t.useCallback(()=>{i(!0),d()},[d]),E=t.useCallback(()=>{i(v=>{const R=!v;return R?d():h(),R})},[d,h]);return t.useEffect(()=>{if(c){i(!0),h();return}return d(),h},[c,d,h]),{visible:u,wake:F,toggle:E}}async function Yt(s,c){if(!mt(s))return;const u=c.replace(/[\\/:*?"<>|]+/g," ").trim()||"livro",i=(l,h)=>{const d=document.createElement("a");d.href=l,d.download=u,h&&(d.target="_blank",d.rel="noopener noreferrer"),document.body.appendChild(d),d.click(),d.remove()};try{const l=await fetch(s,{mode:"cors",credentials:"omit"});if(!l.ok)throw new Error(`HTTP ${l.status}`);const h=URL.createObjectURL(await l.blob());i(h,!1),window.setTimeout(()=>URL.revokeObjectURL(h),6e4)}catch{i(s,!0)}}function Ht(){const[s,c]=t.useState(!1);return t.useEffect(()=>{const u=requestAnimationFrame(()=>c(!0));return()=>cancelAnimationFrame(u)},[]),s?"opacity-100 scale-100":"opacity-0 scale-[0.98]"}const Jt=595,Qt=842;function Wt(){const s=()=>({width:typeof window<"u"?window.innerWidth:1280,height:typeof window<"u"?window.innerHeight:800}),[c,u]=t.useState(s);return t.useEffect(()=>{const i=()=>u(s());return window.addEventListener("resize",i),window.addEventListener("orientationchange",i),()=>{window.removeEventListener("resize",i),window.removeEventListener("orientationchange",i)}},[]),{...c,isMobile:c.width<640,isTablet:c.width>=640&&c.width<1024,isDesktop:c.width>=1024}}const Ut=`
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`,en=`
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`,Zt=350,qt=160,ue=Ut,rt=`
  fixed
  top-1/2
  -translate-y-1/2
  z-20
  flex
  items-center
  w-14 sm:w-24
  h-40 sm:h-[55vh]
  text-white
  opacity-15
  hover:opacity-80
  focus-visible:opacity-80
  active:opacity-80
  disabled:opacity-0
  disabled:pointer-events-none
  transition-opacity
  duration-200
`;function tn({ref:s,title:c,author:u,formatLabel:i,coverUrl:l,onClose:h,loading:d,loadingTitle:F,loadingSubtitle:E,error:v,errorTitle:R,errorPrimary:b,pageNumber:x,numPages:j,canPrev:I,canNext:K,onPrev:L,onNext:p,pageWidth:P,pageHeight:W,continuousScroll:m=!1,onDownload:N,headerExtras:M,panel:y,panelTitle:U,panelOpen:z=!1,onClosePanel:O,onTogglePanel:Z,children:ke}){const Q=t.useRef(null),k=t.useRef(null),de=t.useRef(null),a=t.useRef(null),f=Wt(),{isMobile:_}=f,[G,at]=t.useState(0),[q,De]=t.useState(!1),[B,st]=t.useState(x??1),Y=!d&&!v,ot=Ft({containerRef:k,viewport:f,pageWidth:P,pageHeight:W,rotation:G,enabled:Y}),{scale:C,zoomMode:Fe,zoomIn:ee,zoomOut:te,setManualZoom:Ie,fitToScreen:Oe}=ot,{isFullscreen:Ee,toggleFullscreen:Me}=Ot(Q),he=t.useCallback(e=>{const r=k.current,o=r?.querySelector(`[data-reader-page="${e}"]`);if(!r||!o)return;const w=r.scrollTop+o.getBoundingClientRect().top-r.getBoundingClientRect().top;r.scrollTo({top:w,behavior:"smooth"})},[]),ne=t.useCallback(()=>{m?he(Math.max(B-1,1)):L()},[B,m,L,he]),re=t.useCallback(()=>{m?he(Math.min(B+1,j??B)):p()},[B,m,j,p,he]),Be=t.useRef({x:.5,y:.5}),He=t.useRef({left:0,top:0}),We=t.useRef(!1),ae=t.useRef(!1),V=t.useRef(null),se=t.useRef(null),je=t.useRef(null),A=t.useCallback(()=>{const e=k.current;if(!e)return;const{scrollLeft:r,scrollTop:o,scrollWidth:w,scrollHeight:g,clientWidth:X,clientHeight:S}=e;He.current={left:r,top:o},Be.current={x:w?(r+X/2)/w:.5,y:g?(o+S/2)/g:.5}},[]),oe=t.useRef(.5),[ct,lt]=t.useState(!1),fe=t.useRef(!1),J=t.useRef(0),me=t.useRef(!1),ce=t.useCallback(()=>!fe.current&&(me.current||performance.now()<J.current),[]),be=t.useCallback((e=Zt)=>{J.current=Math.max(J.current,performance.now()+e)},[]),Ne=t.useCallback(()=>{const e=k.current;if(!e)return;const r=e.scrollWidth-e.clientWidth;r<=1||(oe.current=Math.min(1,Math.max(0,e.scrollLeft/r)))},[]),$=t.useCallback(()=>{const e=k.current;if(!e)return;const r=e.scrollWidth-e.clientWidth;if(r<=1)return;const o=Math.round(oe.current*r);Math.abs(e.scrollLeft-o)>1&&(e.scrollLeft=o)},[]),le=t.useCallback(()=>{fe.current||(oe.current=.5),J.current=0,Oe()},[Oe]),ie=t.useCallback(()=>{V.current!==null&&(window.clearTimeout(V.current),V.current=null),je.current?.(),je.current=null,se.current?.disconnect(),se.current=null,ae.current=!1},[]),pe=t.useCallback(()=>{const e=k.current;if(!e)return;ae.current||A(),ae.current=!0,J.current=0;const r=()=>{const{top:o}=He.current;$(),e.scrollTop!==o&&(e.scrollTop=o)};if(r(),window.requestAnimationFrame(r),V.current===null){const o=()=>{ie(),A()},w=["wheel","touchmove","pointerdown","keydown"];w.forEach(g=>e.addEventListener(g,o,{passive:!0})),je.current=()=>w.forEach(g=>e.removeEventListener(g,o)),typeof ResizeObserver<"u"&&(se.current=new ResizeObserver(r),se.current.observe(e),Array.from(e.children).forEach(g=>se.current?.observe(g)))}else window.clearTimeout(V.current);V.current=window.setTimeout(()=>{V.current=null,r(),ie(),A()},450)},[$,A,ie]);t.useEffect(()=>{const e=k.current;if(!e)return;let r=0;const o=()=>{r=0;const Pe=e.getBoundingClientRect().top+e.clientHeight/2,ft=Array.from(e.querySelectorAll("[data-reader-page]")).reduce((Je,_e)=>{const Qe=Math.abs(_e.getBoundingClientRect().top+_e.offsetHeight/2-Pe);return Qe<Je.distance?{page:Number(_e.dataset.readerPage),distance:Qe}:Je},{page:1,distance:Number.POSITIVE_INFINITY});st(ft.page)},w=()=>{if(ae.current){ce()||$();return}ce()?(be(qt),Ne()):$(),A(),m&&!r&&(r=window.requestAnimationFrame(o))},g=()=>be(),X=()=>{me.current=!0},S=()=>{me.current=!1},Ye=Pe=>{Pe.ctrlKey||g()};return e.addEventListener("scroll",w,{passive:!0}),e.addEventListener("wheel",Ye,{passive:!0}),e.addEventListener("touchmove",g,{passive:!0}),e.addEventListener("pointerdown",X,{passive:!0}),window.addEventListener("pointerup",S),window.addEventListener("pointercancel",S),()=>{e.removeEventListener("scroll",w),e.removeEventListener("wheel",Ye),e.removeEventListener("touchmove",g),e.removeEventListener("pointerdown",X),window.removeEventListener("pointerup",S),window.removeEventListener("pointercancel",S),r&&window.cancelAnimationFrame(r),me.current=!1,ie()}},[$,m,be,Ne,A,ie,ce]),t.useEffect(()=>{const e=k.current;if(!e||typeof ResizeObserver>"u")return;const r=new ResizeObserver(()=>{!ae.current&&!ce()&&$()});return r.observe(e),Array.from(e.children).forEach(o=>r.observe(o)),()=>r.disconnect()},[$,x,C,G,Y,ce]),t.useLayoutEffect(()=>{const e=k.current;if(e&&!(m&&!Y)){if(m&&!We.current){e.scrollLeft=0,e.scrollTop=0,We.current=!0,oe.current=e.scrollWidth-e.clientWidth>1?0:.5,A();return}$(),e.scrollTop=Be.current.y*e.scrollHeight-e.clientHeight/2,A()}},[$,m,Y,C,A]);const Ue=t.useRef(x);t.useLayoutEffect(()=>{const e=Ue.current;Ue.current=x,!(e===null||x===null||e===x)&&pe()},[x,pe]),Bt();const{visible:Ze,wake:qe}=nt({suspended:d||!!v||q||z}),{visible:it,wake:Ve}=nt({idleMs:2500,suspended:d||!!v}),T=t.useCallback(()=>{qe(),Ve()},[qe,Ve]),ut=Ht(),Ce=t.useCallback(()=>{at(e=>(e+90)%360)},[]);t.useEffect(()=>{const e=r=>{const o=r.target instanceof HTMLElement?r.target:null;if(!r.defaultPrevented&&!(o?.tagName==="INPUT"||o?.tagName==="TEXTAREA"||o?.tagName==="SELECT"||r.key===" "&&o?.closest('button, a, [role="button"]')||o?.isContentEditable)&&!(r.ctrlKey||r.metaKey||r.altKey))switch(T(),r.key){case"Escape":q?De(!1):z?O?.():document.fullscreenElement?document.exitFullscreen().catch(()=>{}):h();break;case"ArrowRight":case"PageDown":case" ":r.preventDefault(),re();break;case"ArrowLeft":case"PageUp":r.preventDefault(),ne();break;case"+":case"=":r.preventDefault(),ee();break;case"-":case"_":r.preventDefault(),te();break;case"0":r.preventDefault(),le();break;case"r":case"R":r.preventDefault(),Ce();break;case"f":case"F":r.preventDefault(),Me();break;case"t":case"T":Z&&(r.preventDefault(),Z());break}};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[le,h,O,re,ne,Z,z,Ce,q,Me,T,ee,te]);const ve=t.useCallback(e=>{e<0?ee():te()},[ee,te]);t.useEffect(()=>{const e=k.current;if(!e)return;const r=o=>{o.ctrlKey&&(o.preventDefault(),ve(o.deltaY))};return e.addEventListener("wheel",r,{passive:!1}),()=>e.removeEventListener("wheel",r)},[ve]),t.useEffect(()=>{if(!q)return;const e=r=>{de.current?.contains(r.target)||De(!1)};return document.addEventListener("mousedown",e),document.addEventListener("touchstart",e),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("touchstart",e)}},[q]),t.useEffect(()=>{q&&a.current?.scrollIntoView({block:"center"})},[q]);const H=t.useRef(null),xe=t.useRef(0),Te=t.useRef(C),Xe=t.useRef(G);t.useEffect(()=>{Te.current=C,Xe.current=G},[C,G]);const Re=t.useCallback((e,r)=>{if(T(),Math.hypot(e,r)<10){const o=Date.now();o-xe.current<300?(xe.current=0,Fe==="manual"?le():Ie(C*1.5)):xe.current=o;return}xe.current=0,!m&&Math.abs(e)>60&&Math.abs(r)<100&&C<=1.3&&(e<0?re():ne())},[m,le,re,ne,C,Ie,T,Fe]),dt=e=>{if(T(),e.touches.length!==1){H.current=null;return}H.current={x:e.touches[0].clientX,y:e.touches[0].clientY}},ht=e=>{const r=H.current;if(H.current=null,!r)return;const o=e.changedTouches[0];Re(o.clientX-r.x,o.clientY-r.y)};t.useImperativeHandle(s,()=>({wake:T,localTouchStart:(e,r)=>{H.current={x:e,y:r}},localTouchEnd:(e,r)=>{const o=H.current;if(H.current=null,!o)return;const w=Xe.current*Math.PI/180,g=e-o.x,X=r-o.y,S=Te.current;Re((g*Math.cos(w)-X*Math.sin(w))*S,(g*Math.sin(w)+X*Math.cos(w))*S)},localTouchCancel:()=>{H.current=null},isPanMode:()=>Te.current>1.3,wheelZoom:ve,holdScroll:pe}),[pe,Re,T,ve]);const Le=m?B:x,Ke=`${Le??"—"} / ${j??"—"}`,Ge=Le&&j&&j>1?It((Le-1)/(j-1)*100,0,100):0;return n.jsxs("div",{ref:Q,role:"dialog","aria-modal":"true","aria-label":`Leitor de ${c}`,className:`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${ut}
      `,onMouseMove:T,onClick:e=>{e.target===e.currentTarget&&T()},children:[n.jsxs("header",{"aria-hidden":!it,className:`
          relative
          z-30
          flex
          items-center
          gap-2
          px-3 sm:px-4
          py-2
          min-h-[56px]
          shrink-0
          bg-[var(--bg-2)]
          shadow-lg
          transition-[opacity,transform]
          duration-300 ease-out
          ${Ze?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 -translate-y-3 pointer-events-none"}
        `,children:[n.jsx("button",{type:"button",onClick:h,className:ue+" w-10 h-10 hover:text-red-400 hover:bg-red-400/10","aria-label":"Fechar leitor",title:"Fechar (Esc)",children:n.jsx(et,{className:"w-5 h-5"})}),!_&&l&&n.jsx("img",{src:l,alt:"",className:"w-8 h-11 object-cover rounded-md shadow-lg shrink-0",onError:e=>{e.target.style.display="none"}}),n.jsxs("div",{className:"flex-1 min-w-0",children:[n.jsx("p",{className:"text-sm font-semibold truncate",children:c}),n.jsx("p",{className:"text-[11px] text-[var(--text-muted)] truncate",children:_?Ke:`${u} · ${i} · ${Ke}`})]}),M,n.jsxs("div",{className:`
            flex
            items-center
            gap-0.5
            p-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
            shrink-0
          `,role:"toolbar","aria-label":"Ações do leitor",children:[n.jsx("button",{type:"button",onClick:()=>{Me()},className:ue+" w-9 h-9",title:Ee?"Sair da tela cheia (F)":"Tela cheia (F)","aria-label":Ee?"Sair da tela cheia":"Tela cheia",children:Ee?n.jsx(Rt,{className:"w-4 h-4"}):n.jsx(Ct,{className:"w-4 h-4"})}),n.jsx("button",{type:"button",onClick:Ce,className:ue+" w-9 h-9",title:"Girar página / orientação (R)","aria-label":"Girar página",children:n.jsx($t,{className:"w-4 h-4"})}),N&&n.jsx("button",{type:"button",onClick:N,className:ue+" w-9 h-9",title:`Baixar ${i}`,"aria-label":`Baixar ${i}`,children:n.jsx(yt,{className:"w-4 h-4"})})]})]}),n.jsx("div",{role:"progressbar","aria-label":"Progresso de leitura","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(Ge),className:"relative z-30 h-[3px] shrink-0 bg-white/10",children:n.jsx("div",{className:"h-full bg-[var(--gold)] transition-[width] duration-300 ease-out",style:{width:`${Ge}%`}})}),n.jsxs("main",{ref:k,className:`
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        `,onTouchStart:dt,onTouchEnd:ht,children:[n.jsx("div",{className:`
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          `}),d&&!v&&n.jsxs("div",{className:`
              absolute
              inset-0
              z-20
              flex
              flex-col
              items-center
              justify-center
              gap-4
              bg-[#18181c]
            `,children:[n.jsx("div",{className:`
                w-14 h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--gold-glow)]
              `,children:n.jsx(bt,{className:"w-7 h-7 animate-spin text-[var(--gold)]"})}),n.jsxs("div",{className:"text-center",children:[n.jsx("p",{className:"text-sm font-medium",children:F}),n.jsx("p",{className:"mt-1 text-xs text-[var(--text-muted)]",children:E})]})]}),v&&n.jsx("div",{className:`
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              p-6
            `,children:n.jsxs("div",{className:`
                max-w-md
                w-full
                p-8
                rounded-3xl
                text-center
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              `,children:[n.jsx("div",{className:`
                  mx-auto
                  mb-5
                  w-16 h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-red-500/10
                `,children:n.jsx(pt,{className:"w-8 h-8 text-red-400"})}),n.jsx("h2",{className:"text-base font-semibold",children:R}),n.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--text-muted)]",children:v}),n.jsxs("div",{className:"mt-6 flex flex-wrap justify-center gap-2",children:[b&&n.jsx("button",{type:"button",onClick:b.onClick,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    `,children:b.label}),N&&n.jsx("button",{type:"button",onClick:N,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    `,children:"Baixar"}),n.jsx("button",{type:"button",onClick:h,className:`
                    px-4 py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                    transition
                  `,children:"Fechar"})]})]})}),n.jsx("div",{className:`
            relative
            z-10
            flex
            min-h-full
            min-w-full
            w-max
            ${m?"items-start justify-start":"items-center justify-center"}
            px-0
            sm:px-4
            py-3
            sm:py-6
          `,style:{touchAction:C>1.25?"pan-x pan-y":"pan-y"},children:n.jsx("div",{className:m?"w-max min-w-full select-none":"select-none",children:ke({scale:C,rotation:G})})}),Y&&n.jsxs(n.Fragment,{children:[n.jsx("button",{type:"button",onClick:ne,disabled:m?B<=1:!I,className:`${rt} left-0 justify-start pl-1 sm:pl-3`,title:"Página anterior (←)","aria-label":"Página anterior",children:n.jsx(vt,{className:"w-7 h-7 sm:w-9 sm:h-9"})}),n.jsx("button",{type:"button",onClick:re,disabled:m?B>=(j??0):!K,className:`${rt} right-0 justify-end pr-1 sm:pr-3`,title:"Próxima página (→)","aria-label":"Próxima página",children:n.jsx(wt,{className:"w-7 h-7 sm:w-9 sm:h-9"})})]}),z&&y&&n.jsxs("aside",{className:`
              fixed
              left-0
              bottom-0
              z-40
              w-[300px]
              max-w-[85vw]
              bg-[var(--bg-2)]
              border-r
              border-[var(--border)]
              shadow-2xl
              overflow-y-auto
            `,style:{top:59},children:[n.jsxs("div",{className:`
                sticky
                top-0
                z-10
                flex items-center
                justify-between
                px-4 py-3
                bg-[var(--bg-2)]
                border-b
                border-[var(--border)]
              `,children:[n.jsx("h2",{className:"text-sm font-semibold text-[var(--text)]",children:U}),n.jsx("button",{type:"button",onClick:O,className:ue+" w-8 h-8","aria-label":`Fechar ${U??"painel"}`,children:n.jsx(et,{className:"w-4 h-4"})})]}),n.jsx("nav",{className:"p-2",children:y})]})]}),Y&&n.jsx(Dt,{zoom:Math.round(C*100),onZoomIn:ee,onZoomOut:te,onReset:le,onPan:be,positionLocked:ct,onPositionChange:e=>{oe.current=e},onTogglePositionLock:()=>{const e=!fe.current;e&&Ne(),fe.current=e,J.current=0,lt(e),T()},scrollRef:k,minZoom:ge,maxZoom:ye,hidden:!Ze,onActivity:T})]})}function nn({width:s,height:c,scale:u,rotation:i,children:l}){const h=i%180!==0;return n.jsx("div",{className:"relative shrink-0",style:{width:(h?c:s)*u,height:(h?s:c)*u},children:n.jsx("div",{className:"absolute",style:{left:"50%",top:"50%",width:s,height:c,transform:`translate(-50%, -50%) rotate(${i}deg) scale(${u})`,transformOrigin:"center center"},children:l})})}export{Qt as P,tn as R,nn as S,Jt as a,Ut as b,Kt as c,en as d,Gt as g,Yt as t};
