import{b as ne,r as e,j as n,X as Fe,L as Je,B as Qe,C as et}from"./index-DdVkJmPQ.js";var yt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function kt(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}const tt=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],nt=ne("chevron-right",tt);const rt=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],at=ne("download",rt);const st=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]],ot=ne("maximize",st);const lt=[["path",{d:"M8 3v3a2 2 0 0 1-2 2H3",key:"hohbtr"}],["path",{d:"M21 8h-3a2 2 0 0 1-2-2V3",key:"5jw1f3"}],["path",{d:"M3 16h3a2 2 0 0 1 2 2v3",key:"198tvr"}],["path",{d:"M16 21v-3a2 2 0 0 1 2-2h3",key:"ph8mxp"}]],ct=ne("minimize",lt);const it=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],ut=ne("rotate-cw",it),dt=100,ge=72,ye=2,Ie=60,Be=`
  flex-none flex items-center justify-center
  w-[34px] h-[34px] rounded-full
  text-[var(--text-sub)] text-xl leading-none select-none
  hover:text-[var(--gold)] hover:bg-[var(--gold-glow)]
  active:scale-95 transition
  disabled:opacity-30 disabled:pointer-events-none
`;function ft({zoom:a,onZoomIn:o,onZoomOut:u,onReset:i,scrollRef:l,minZoom:f=25,maxZoom:d=300,hidden:P=!1,onActivity:y}){const p=e.useRef(null),[j,M]=e.useState(.5),[x,E]=e.useState(!1),[F,Z]=e.useState(!1),z=e.useRef({startX:0,startPos:0}),b=e.useRef(null),w=e.useCallback(()=>{const s=l.current;if(!s)return;const h=s.scrollWidth-s.clientWidth;h>1?(E(!0),M(Math.min(1,Math.max(0,s.scrollLeft/h)))):(E(!1),M(.5))},[l]);e.useEffect(()=>{const s=l.current;if(!s)return;s.addEventListener("scroll",w,{passive:!0}),window.addEventListener("resize",w);let h;return typeof ResizeObserver<"u"&&(h=new ResizeObserver(w),h.observe(s),Array.from(s.children).forEach(N=>h?.observe(N))),()=>{s.removeEventListener("scroll",w),window.removeEventListener("resize",w),h?.disconnect()}},[l,w]),e.useEffect(()=>{const s=requestAnimationFrame(w);return()=>cancelAnimationFrame(s)},[a,w]);const g=e.useCallback(()=>{b.current!==null&&(window.clearInterval(b.current),b.current=null)},[]);e.useEffect(()=>g,[g]);const m=s=>h=>{h.preventDefault(),y?.(),g(),s(),b.current=window.setInterval(()=>{y?.(),s()},dt)},_=()=>{const s=p.current;return s?s.clientWidth-ge-ye*2:0},q=s=>{const h=l.current;h&&(h.scrollLeft=Math.min(1,Math.max(0,s))*(h.scrollWidth-h.clientWidth))},U=s=>{s.preventDefault(),s.stopPropagation(),y?.(),s.currentTarget.setPointerCapture(s.pointerId),z.current={startX:s.clientX,startPos:j},Z(!0)},W=s=>{if(!F||!x)return;const h=_();h<=0||(y?.(),q(z.current.startPos+(s.clientX-z.current.startX)/h))},C=s=>{s.currentTarget.hasPointerCapture(s.pointerId)&&s.currentTarget.releasePointerCapture(s.pointerId),Z(!1)},I=s=>{const h=l.current;if(h){if(s.key==="ArrowLeft")h.scrollLeft-=Ie;else if(s.key==="ArrowRight")h.scrollLeft+=Ie;else return;s.preventDefault(),s.stopPropagation(),y?.()}},A=P&&!F;return n.jsxs("div",{role:"group","aria-label":"Controles de zoom e rolagem horizontal","aria-hidden":A,onPointerDown:y,className:`
        fixed left-1/2 z-30 -translate-x-1/2
        bottom-[calc(14px+env(safe-area-inset-bottom,0px))]
        flex items-center gap-1.5 p-1
        w-[min(94vw,400px)]
        rounded-full border border-[var(--border-2)]
        bg-[var(--bg-2)]/60 backdrop-blur-sm
        select-none transition-[opacity,transform] duration-500 ease-out
        ${A?"opacity-0 translate-y-3 pointer-events-none":"opacity-40 hover:opacity-100 active:opacity-100 focus-within:opacity-100"}
      `,children:[n.jsx("button",{type:"button",className:Be,"aria-label":"Diminuir zoom",title:"Diminuir zoom (−)",disabled:a<=f,onPointerDown:m(u),onPointerUp:g,onPointerLeave:g,onPointerCancel:g,children:"−"}),n.jsxs("div",{ref:p,className:`
          relative flex-1 h-[34px] rounded-full overflow-hidden
          bg-[var(--bg)] border border-[var(--border)]
          shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]
        `,style:{backgroundImage:"repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 14px)"},children:[n.jsx("span",{"aria-hidden":!0,className:"absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"‹"}),n.jsx("span",{"aria-hidden":!0,className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"›"}),n.jsxs("div",{role:"slider",tabIndex:0,"aria-label":"Mover a página para os lados","aria-orientation":"horizontal","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(j*100),"aria-disabled":!x,title:x?"Arraste para os lados · toque duplo ajusta à tela":"Aumente o zoom para rolar para os lados",onPointerDown:U,onPointerMove:W,onPointerUp:C,onPointerCancel:C,onDoubleClick:i,onKeyDown:I,className:`
            absolute top-[2px] h-7 flex items-center justify-center
            rounded-full border-2 bg-[var(--bg)]
            text-[13px] font-bold text-white touch-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)]
            ${x?"border-[var(--gold)]":"border-[var(--gold-dark)] opacity-60"}
            ${F?"cursor-grabbing border-[var(--gold-bright)] shadow-[0_0_14px_rgba(240,224,184,.45)]":"cursor-grab transition-[left] duration-150"}
          `,style:{width:ge,left:`calc(${ye}px + (100% - ${ge+ye*2}px) * ${j})`},children:[Math.round(a),"%"]})]}),n.jsx("button",{type:"button",className:Be,"aria-label":"Aumentar zoom",title:"Aumentar zoom (+)",disabled:a>=d,onPointerDown:m(o),onPointerUp:g,onPointerLeave:g,onPointerCancel:g,children:"+"})]})}const ie=25,ue=300,ke=100,ce=5;function ht({containerRef:a,viewport:o,pageWidth:u,pageHeight:i,rotation:l,enabled:f}){const{isMobile:d,isTablet:P}=o,[y,p]=e.useState(ke/100),[j,M]=e.useState("fit"),x=e.useCallback(()=>{const b=a.current;if(!b)return ke/100;const w=b.clientWidth,g=b.clientHeight;if(!w||!g)return ke/100;const m=l%180!==0,_=m?i:u,q=m?u:i,U=d?0:32,W=d?24:48,C=Math.max(w-U,200)/_,I=Math.max(g-W,200)/q,A=d||P?C:Math.min(C,I);return Math.min(Math.max(A,ie/100),ue/100)},[a,d,P,i,u,l]);e.useEffect(()=>{if(!f||j!=="fit")return;const b=requestAnimationFrame(()=>p(x()));return()=>cancelAnimationFrame(b)},[x,f,j,o.width,o.height,u,i,l]);const E=e.useCallback(b=>{const w=Math.max(ie,Math.min(ue,b));M("manual"),p(w/100)},[]),F=e.useCallback(()=>{M("manual"),p(b=>Math.min(ue,(Math.floor(Math.round(b*100)/ce)+1)*ce)/100)},[]),Z=e.useCallback(()=>{M("manual"),p(b=>Math.max(ie,(Math.ceil(Math.round(b*100)/ce)-1)*ce)/100)},[]),z=e.useCallback(()=>{M("fit"),p(x()),window.requestAnimationFrame(()=>{a.current?.scrollTo({top:0,left:0,behavior:"smooth"})})},[x,a]);return{scale:y,zoomMode:j,zoomPercentage:`${Math.round(y*100)}%`,zoomIn:F,zoomOut:Z,setManualZoom:E,fitToScreen:z}}function mt(a,o,u){return Math.min(Math.max(a,o),u)}function bt(a){const[o,u]=e.useState(!1);e.useEffect(()=>{const l=()=>{u(!!document.fullscreenElement&&document.fullscreenElement===a.current)};return document.addEventListener("fullscreenchange",l),()=>{document.removeEventListener("fullscreenchange",l)}},[a]);const i=e.useCallback(async()=>{try{document.fullscreenElement?await document.exitFullscreen():await a.current?.requestFullscreen()}catch(l){console.warn("Não foi possível alternar o fullscreen.",l)}},[a]);return{isFullscreen:o,toggleFullscreen:i}}function pt(a=!0){e.useEffect(()=>{if(!a)return;const o=document.documentElement,u=document.body.style.overflow,i=o.style.overscrollBehavior;return document.body.style.overflow="hidden",o.style.overscrollBehavior="none",()=>{document.body.style.overflow=u,o.style.overscrollBehavior=i}},[a])}function Oe({idleMs:a=3200,suspended:o=!1}={}){const[u,i]=e.useState(!0),l=e.useRef(null),f=e.useCallback(()=>{l.current!==null&&(window.clearTimeout(l.current),l.current=null)},[]),d=e.useCallback(()=>{f(),!o&&(l.current=window.setTimeout(()=>{i(!1)},a))},[f,a,o]),P=e.useCallback(()=>{i(!0),d()},[d]),y=e.useCallback(()=>{i(p=>{const j=!p;return j?d():f(),j})},[d,f]);return e.useEffect(()=>{if(o){i(!0),f();return}return d(),f},[o,d,f]),{visible:u,wake:P,toggle:y}}async function jt(a,o){const u=o.replace(/[\\/:*?"<>|]+/g," ").trim()||"livro",i=(l,f)=>{const d=document.createElement("a");d.href=l,d.download=u,f&&(d.target="_blank",d.rel="noopener noreferrer"),document.body.appendChild(d),d.click(),d.remove()};try{const l=await fetch(a,{mode:"cors",credentials:"omit"});if(!l.ok)throw new Error(`HTTP ${l.status}`);const f=URL.createObjectURL(await l.blob());i(f,!1),window.setTimeout(()=>URL.revokeObjectURL(f),6e4)}catch{i(a,!0)}}function xt(){const[a,o]=e.useState(!1);return e.useEffect(()=>{const u=requestAnimationFrame(()=>o(!0));return()=>cancelAnimationFrame(u)},[]),a?"opacity-100 scale-100":"opacity-0 scale-[0.98]"}const Et=595,Mt=842;function vt(){const a=()=>({width:typeof window<"u"?window.innerWidth:1280,height:typeof window<"u"?window.innerHeight:800}),[o,u]=e.useState(a);return e.useEffect(()=>{const i=()=>u(a());return window.addEventListener("resize",i),window.addEventListener("orientationchange",i),()=>{window.removeEventListener("resize",i),window.removeEventListener("orientationchange",i)}},[]),{...o,isMobile:o.width<640,isTablet:o.width>=640&&o.width<1024,isDesktop:o.width>=1024}}const wt=`
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`,Nt=`
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`,te=wt,He=`
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
`;function Ct({ref:a,title:o,author:u,formatLabel:i,coverUrl:l,onClose:f,loading:d,loadingTitle:P,loadingSubtitle:y,error:p,errorTitle:j,errorPrimary:M,pageNumber:x,numPages:E,canPrev:F,canNext:Z,onPrev:z,onNext:b,pageWidth:w,pageHeight:g,continuousScroll:m=!1,onDownload:_,headerExtras:q,panel:U,panelTitle:W,panelOpen:C=!1,onClosePanel:I,onTogglePanel:A,children:s}){const h=e.useRef(null),N=e.useRef(null),Ze=e.useRef(null),Ue=e.useRef(null),je=vt(),{isMobile:Ee}=je,[X,We]=e.useState(0),[B,Me]=e.useState(!1),[D,qe]=e.useState(x??1),de=!d&&!p,Xe=ht({containerRef:N,viewport:je,pageWidth:w,pageHeight:g,rotation:X,enabled:de}),{scale:T,zoomMode:Ne,zoomIn:V,zoomOut:G,setManualZoom:Ce,fitToScreen:K}=Xe,{isFullscreen:fe,toggleFullscreen:he}=bt(h),re=e.useCallback(t=>{const r=N.current,c=r?.querySelector(`[data-reader-page="${t}"]`);if(!r||!c)return;const v=r.scrollTop+c.getBoundingClientRect().top-r.getBoundingClientRect().top;r.scrollTo({top:v,behavior:"smooth"})},[]),Y=e.useCallback(()=>{m?re(Math.max(D-1,1)):z()},[D,m,z,re]),J=e.useCallback(()=>{m?re(Math.min(D+1,E??D)):b()},[D,m,E,b,re]),me=e.useRef({x:.5,y:.5}),Te=e.useRef({left:0,top:0}),Re=e.useRef(!1),ae=e.useRef(!1),O=e.useRef(null),Q=e.useRef(null),be=e.useRef(null),L=e.useCallback(()=>{const t=N.current;if(!t)return;const{scrollLeft:r,scrollTop:c,scrollWidth:v,scrollHeight:k,clientWidth:H,clientHeight:$}=t;Te.current={left:r,top:c},me.current={x:v?(r+H/2)/v:.5,y:k?(c+$/2)/k:.5}},[]),ee=e.useCallback(()=>{O.current!==null&&(window.clearTimeout(O.current),O.current=null),be.current?.(),be.current=null,Q.current?.disconnect(),Q.current=null,ae.current=!1},[]),se=e.useCallback(()=>{const t=N.current;if(!t)return;ae.current||L(),ae.current=!0;const r=()=>{const{left:c,top:v}=Te.current;t.scrollLeft!==c&&(t.scrollLeft=c),t.scrollTop!==v&&(t.scrollTop=v)};if(r(),O.current===null){window.requestAnimationFrame(r);const c=()=>{ee(),L()},v=["wheel","touchmove","pointerdown","keydown"];v.forEach(k=>t.addEventListener(k,c,{passive:!0})),be.current=()=>v.forEach(k=>t.removeEventListener(k,c)),typeof ResizeObserver<"u"&&(Q.current=new ResizeObserver(r),Q.current.observe(t),Array.from(t.children).forEach(k=>Q.current?.observe(k)))}else window.clearTimeout(O.current);O.current=window.setTimeout(()=>{O.current=null,r(),ee(),L()},450)},[L,ee]);e.useEffect(()=>{const t=N.current;if(!t)return;const r=()=>{if(!ae.current&&(L(),m)){const c=t.getBoundingClientRect().top+t.clientHeight/2,k=Array.from(t.querySelectorAll("[data-reader-page]")).reduce((H,$)=>{const $e=Math.abs($.getBoundingClientRect().top+$.offsetHeight/2-c);return $e<H.distance?{page:Number($.dataset.readerPage),distance:$e}:H},{page:1,distance:Number.POSITIVE_INFINITY});qe(k.page)}};return t.addEventListener("scroll",r,{passive:!0}),()=>{t.removeEventListener("scroll",r),ee()}},[m,L,ee]),e.useLayoutEffect(()=>{const t=N.current;if(t){if(m&&!Re.current){t.scrollLeft=0,t.scrollTop=0,Re.current=!0,L();return}t.scrollLeft=me.current.x*t.scrollWidth-t.clientWidth/2,t.scrollTop=me.current.y*t.scrollHeight-t.clientHeight/2,L()}},[m,T,L]);const Le=e.useRef(x);e.useLayoutEffect(()=>{const t=Le.current;Le.current=x,!(t===null||x===null||t===x)&&se()},[x,se]),pt();const{visible:Pe,wake:ze}=Oe({suspended:d||!!p||B||C}),{visible:Ve,wake:_e}=Oe({idleMs:2500,suspended:d||!!p}),R=e.useCallback(()=>{ze(),_e()},[ze,_e]),Ge=xt(),pe=e.useCallback(()=>{We(t=>(t+90)%360)},[]);e.useEffect(()=>{const t=r=>{const c=r.target;if(!(c?.tagName==="INPUT"||c?.tagName==="TEXTAREA"||c?.isContentEditable)&&!(r.ctrlKey||r.metaKey||r.altKey))switch(R(),r.key){case"Escape":B?Me(!1):C?I?.():document.fullscreenElement?document.exitFullscreen().catch(()=>{}):f();break;case"ArrowRight":case"PageDown":case" ":r.preventDefault(),J();break;case"ArrowLeft":case"PageUp":r.preventDefault(),Y();break;case"+":case"=":r.preventDefault(),V();break;case"-":case"_":r.preventDefault(),G();break;case"0":r.preventDefault(),K();break;case"r":case"R":r.preventDefault(),pe();break;case"f":case"F":r.preventDefault(),he();break;case"t":case"T":A&&(r.preventDefault(),A());break}};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[K,f,I,J,Y,A,C,pe,B,he,R,V,G]);const oe=e.useCallback(t=>{t<0?V():G()},[V,G]);e.useEffect(()=>{const t=N.current;if(!t)return;const r=c=>{c.ctrlKey&&(c.preventDefault(),oe(c.deltaY))};return t.addEventListener("wheel",r,{passive:!1}),()=>t.removeEventListener("wheel",r)},[oe]),e.useEffect(()=>{if(!B)return;const t=r=>{Ze.current?.contains(r.target)||Me(!1)};return document.addEventListener("mousedown",t),document.addEventListener("touchstart",t),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("touchstart",t)}},[B]),e.useEffect(()=>{B&&Ue.current?.scrollIntoView({block:"center"})},[B]);const S=e.useRef(null),le=e.useRef(0),xe=e.useRef(T),Ae=e.useRef(X);e.useEffect(()=>{xe.current=T,Ae.current=X},[T,X]);const ve=e.useCallback((t,r)=>{if(R(),Math.hypot(t,r)<10){const c=Date.now();c-le.current<300?(le.current=0,Ne==="manual"?K():Ce(T*1.5)):le.current=c;return}le.current=0,!m&&Math.abs(t)>60&&Math.abs(r)<100&&T<=1.3&&(t<0?J():Y())},[m,K,J,Y,T,Ce,R,Ne]),Ke=t=>{if(R(),t.touches.length!==1){S.current=null;return}S.current={x:t.touches[0].clientX,y:t.touches[0].clientY}},Ye=t=>{const r=S.current;if(S.current=null,!r)return;const c=t.changedTouches[0];ve(c.clientX-r.x,c.clientY-r.y)};e.useImperativeHandle(a,()=>({wake:R,localTouchStart:(t,r)=>{S.current={x:t,y:r}},localTouchEnd:(t,r)=>{const c=S.current;if(S.current=null,!c)return;const v=Ae.current*Math.PI/180,k=t-c.x,H=r-c.y,$=xe.current;ve((k*Math.cos(v)-H*Math.sin(v))*$,(k*Math.sin(v)+H*Math.cos(v))*$)},localTouchCancel:()=>{S.current=null},isPanMode:()=>xe.current>1.3,wheelZoom:oe,holdScroll:se}),[se,ve,R,oe]);const we=m?D:x,De=`${we??"—"} / ${E??"—"}`,Se=we&&E&&E>1?mt((we-1)/(E-1)*100,0,100):0;return n.jsxs("div",{ref:h,role:"dialog","aria-modal":"true","aria-label":`Leitor de ${o}`,className:`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${Ge}
      `,onMouseMove:R,onClick:t=>{t.target===t.currentTarget&&R()},children:[n.jsxs("header",{"aria-hidden":!Ve,className:`
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
          ${Pe?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 -translate-y-3 pointer-events-none"}
        `,children:[n.jsx("button",{type:"button",onClick:f,className:te+" w-10 h-10 hover:text-red-400 hover:bg-red-400/10","aria-label":"Fechar leitor",title:"Fechar (Esc)",children:n.jsx(Fe,{className:"w-5 h-5"})}),!Ee&&l&&n.jsx("img",{src:l,alt:"",className:"w-8 h-11 object-cover rounded-md shadow-lg shrink-0",onError:t=>{t.target.style.display="none"}}),n.jsxs("div",{className:"flex-1 min-w-0",children:[n.jsx("p",{className:"text-sm font-semibold truncate",children:o}),n.jsx("p",{className:"text-[11px] text-[var(--text-muted)] truncate",children:Ee?De:`${u} · ${i} · ${De}`})]}),q,n.jsxs("div",{className:`
            flex
            items-center
            gap-0.5
            p-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
            shrink-0
          `,role:"toolbar","aria-label":"Ações do leitor",children:[n.jsx("button",{type:"button",onClick:()=>{he()},className:te+" w-9 h-9",title:fe?"Sair da tela cheia (F)":"Tela cheia (F)","aria-label":fe?"Sair da tela cheia":"Tela cheia",children:fe?n.jsx(ct,{className:"w-4 h-4"}):n.jsx(ot,{className:"w-4 h-4"})}),n.jsx("button",{type:"button",onClick:pe,className:te+" w-9 h-9",title:"Girar página / orientação (R)","aria-label":"Girar página",children:n.jsx(ut,{className:"w-4 h-4"})}),_&&n.jsx("button",{type:"button",onClick:_,className:te+" w-9 h-9",title:`Baixar ${i}`,"aria-label":`Baixar ${i}`,children:n.jsx(at,{className:"w-4 h-4"})})]})]}),n.jsx("div",{role:"progressbar","aria-label":"Progresso de leitura","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(Se),className:"relative z-30 h-[3px] shrink-0 bg-white/10",children:n.jsx("div",{className:"h-full bg-[var(--gold)] transition-[width] duration-300 ease-out",style:{width:`${Se}%`}})}),n.jsxs("main",{ref:N,className:`
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        `,onTouchStart:Ke,onTouchEnd:Ye,children:[n.jsx("div",{className:`
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          `}),d&&!p&&n.jsxs("div",{className:`
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
              `,children:n.jsx(Je,{className:"w-7 h-7 animate-spin text-[var(--gold)]"})}),n.jsxs("div",{className:"text-center",children:[n.jsx("p",{className:"text-sm font-medium",children:P}),n.jsx("p",{className:"mt-1 text-xs text-[var(--text-muted)]",children:y})]})]}),p&&n.jsx("div",{className:`
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
                `,children:n.jsx(Qe,{className:"w-8 h-8 text-red-400"})}),n.jsx("h2",{className:"text-base font-semibold",children:j}),n.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--text-muted)]",children:p}),n.jsxs("div",{className:"mt-6 flex flex-wrap justify-center gap-2",children:[M&&n.jsx("button",{type:"button",onClick:M.onClick,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    `,children:M.label}),_&&n.jsx("button",{type:"button",onClick:_,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    `,children:"Baixar"}),n.jsx("button",{type:"button",onClick:f,className:`
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
          `,style:{touchAction:T>1.25?"pan-x pan-y":"pan-y"},children:n.jsx("div",{className:m?"w-full select-none":"select-none",children:s({scale:T,rotation:X})})}),de&&n.jsxs(n.Fragment,{children:[n.jsx("button",{type:"button",onClick:Y,disabled:m?D<=1:!F,className:`${He} left-0 justify-start pl-1 sm:pl-3`,title:"Página anterior (←)","aria-label":"Página anterior",children:n.jsx(et,{className:"w-7 h-7 sm:w-9 sm:h-9"})}),n.jsx("button",{type:"button",onClick:J,disabled:m?D>=(E??0):!Z,className:`${He} right-0 justify-end pr-1 sm:pr-3`,title:"Próxima página (→)","aria-label":"Próxima página",children:n.jsx(nt,{className:"w-7 h-7 sm:w-9 sm:h-9"})})]}),C&&U&&n.jsxs("aside",{className:`
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
              `,children:[n.jsx("h2",{className:"text-sm font-semibold text-[var(--text)]",children:W}),n.jsx("button",{type:"button",onClick:I,className:te+" w-8 h-8","aria-label":`Fechar ${W??"painel"}`,children:n.jsx(Fe,{className:"w-4 h-4"})})]}),n.jsx("nav",{className:"p-2",children:U})]})]}),de&&n.jsx(ft,{zoom:Math.round(T*100),onZoomIn:V,onZoomOut:G,onReset:K,scrollRef:N,minZoom:ie,maxZoom:ue,hidden:!Pe,onActivity:R})]})}function Tt({width:a,height:o,scale:u,rotation:i,children:l}){const f=i%180!==0;return n.jsx("div",{className:"relative shrink-0",style:{width:(f?o:a)*u,height:(f?a:o)*u},children:n.jsx("div",{className:"absolute",style:{left:"50%",top:"50%",width:a,height:o,transform:`translate(-50%, -50%) rotate(${i}deg) scale(${u})`,transformOrigin:"center center"},children:l})})}export{Mt as P,Ct as R,Tt as S,Et as a,wt as b,yt as c,Nt as d,kt as g,jt as t};
