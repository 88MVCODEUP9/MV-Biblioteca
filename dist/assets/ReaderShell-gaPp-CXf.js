import{b as q,r as t,j as e,X as ke,L as $e,B as De,C as Ae}from"./index-DQuTL6tD.js";var at=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function st(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}const Fe=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Ie=q("chevron-right",Fe);const Be=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],Oe=q("download",Be);const He=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]],Ze=q("maximize",He);const Ue=[["path",{d:"M8 3v3a2 2 0 0 1-2 2H3",key:"hohbtr"}],["path",{d:"M21 8h-3a2 2 0 0 1-2-2V3",key:"5jw1f3"}],["path",{d:"M3 16h3a2 2 0 0 1 2 2v3",key:"198tvr"}],["path",{d:"M16 21v-3a2 2 0 0 1 2-2h3",key:"ph8mxp"}]],We=q("minimize",Ue);const Xe=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],qe=q("rotate-cw",Xe),Ge=100,ce=72,ie=2,je=60,Ee=`
  flex-none flex items-center justify-center
  w-[34px] h-[34px] rounded-full
  text-[var(--text-sub)] text-xl leading-none select-none
  hover:text-[var(--gold)] hover:bg-[var(--gold-glow)]
  active:scale-95 transition
  disabled:opacity-30 disabled:pointer-events-none
`;function Ke({zoom:r,onZoomIn:s,onZoomOut:u,onReset:c,scrollRef:l,minZoom:h=25,maxZoom:d=300,hidden:C=!1,onActivity:v}){const b=t.useRef(null),[g,y]=t.useState(.5),[w,N]=t.useState(!1),[_,P]=t.useState(!1),k=t.useRef({startX:0,startPos:0}),m=t.useRef(null),p=t.useCallback(()=>{const a=l.current;if(!a)return;const i=a.scrollWidth-a.clientWidth;i>1?(N(!0),y(Math.min(1,Math.max(0,a.scrollLeft/i)))):(N(!1),y(.5))},[l]);t.useEffect(()=>{const a=l.current;if(!a)return;a.addEventListener("scroll",p,{passive:!0}),window.addEventListener("resize",p);let i;return typeof ResizeObserver<"u"&&(i=new ResizeObserver(p),i.observe(a),Array.from(a.children).forEach(ee=>i?.observe(ee))),()=>{a.removeEventListener("scroll",p),window.removeEventListener("resize",p),i?.disconnect()}},[l,p]),t.useEffect(()=>{const a=requestAnimationFrame(p);return()=>cancelAnimationFrame(a)},[r,p]);const x=t.useCallback(()=>{m.current!==null&&(window.clearInterval(m.current),m.current=null)},[]);t.useEffect(()=>x,[x]);const j=a=>i=>{i.preventDefault(),v?.(),x(),a(),m.current=window.setInterval(()=>{v?.(),a()},Ge)},I=()=>{const a=b.current;return a?a.clientWidth-ce-ie*2:0},$=a=>{const i=l.current;i&&(i.scrollLeft=Math.min(1,Math.max(0,a))*(i.scrollWidth-i.clientWidth))},D=a=>{a.preventDefault(),a.stopPropagation(),v?.(),a.currentTarget.setPointerCapture(a.pointerId),k.current={startX:a.clientX,startPos:g},P(!0)},L=a=>{if(!_||!w)return;const i=I();i<=0||(v?.(),$(k.current.startPos+(a.clientX-k.current.startX)/i))},T=a=>{a.currentTarget.hasPointerCapture(a.pointerId)&&a.currentTarget.releasePointerCapture(a.pointerId),P(!1)},z=a=>{const i=l.current;if(i){if(a.key==="ArrowLeft")i.scrollLeft-=je;else if(a.key==="ArrowRight")i.scrollLeft+=je;else return;a.preventDefault(),a.stopPropagation(),v?.()}},A=C&&!_;return e.jsxs("div",{role:"group","aria-label":"Controles de zoom e rolagem horizontal","aria-hidden":A,onPointerDown:v,className:`
        fixed left-1/2 z-30 -translate-x-1/2
        bottom-[calc(14px+env(safe-area-inset-bottom,0px))]
        flex items-center gap-1.5 p-1
        w-[min(94vw,400px)]
        rounded-full border border-[var(--border-2)]
        bg-[var(--bg-2)]/60 backdrop-blur-sm
        select-none transition-[opacity,transform] duration-500 ease-out
        ${A?"opacity-0 translate-y-3 pointer-events-none":"opacity-40 hover:opacity-100 active:opacity-100 focus-within:opacity-100"}
      `,children:[e.jsx("button",{type:"button",className:Ee,"aria-label":"Diminuir zoom",title:"Diminuir zoom (−)",disabled:r<=h,onPointerDown:j(u),onPointerUp:x,onPointerLeave:x,onPointerCancel:x,children:"−"}),e.jsxs("div",{ref:b,className:`
          relative flex-1 h-[34px] rounded-full overflow-hidden
          bg-[var(--bg)] border border-[var(--border)]
          shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]
        `,style:{backgroundImage:"repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 14px)"},children:[e.jsx("span",{"aria-hidden":!0,className:"absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"‹"}),e.jsx("span",{"aria-hidden":!0,className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none",children:"›"}),e.jsxs("div",{role:"slider",tabIndex:0,"aria-label":"Mover a página para os lados","aria-orientation":"horizontal","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(g*100),"aria-disabled":!w,title:w?"Arraste para os lados · toque duplo ajusta à tela":"Aumente o zoom para rolar para os lados",onPointerDown:D,onPointerMove:L,onPointerUp:T,onPointerCancel:T,onDoubleClick:c,onKeyDown:z,className:`
            absolute top-[2px] h-7 flex items-center justify-center
            rounded-full border-2 bg-[var(--bg)]
            text-[13px] font-bold text-white touch-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)]
            ${w?"border-[var(--gold)]":"border-[var(--gold-dark)] opacity-60"}
            ${_?"cursor-grabbing border-[var(--gold-bright)] shadow-[0_0_14px_rgba(240,224,184,.45)]":"cursor-grab transition-[left] duration-150"}
          `,style:{width:ce,left:`calc(${ie}px + (100% - ${ce+ie*2}px) * ${g})`},children:[Math.round(r),"%"]})]}),e.jsx("button",{type:"button",className:Ee,"aria-label":"Aumentar zoom",title:"Aumentar zoom (+)",disabled:r>=d,onPointerDown:j(s),onPointerUp:x,onPointerLeave:x,onPointerCancel:x,children:"+"})]})}const J=25,Q=300,ue=100,Y=5;function Ve({containerRef:r,viewport:s,pageWidth:u,pageHeight:c,rotation:l,enabled:h}){const{isMobile:d,isTablet:C}=s,[v,b]=t.useState(ue/100),[g,y]=t.useState("fit"),w=t.useCallback(()=>{const m=r.current;if(!m)return ue/100;const p=m.clientWidth,x=m.clientHeight;if(!p||!x)return ue/100;const j=l%180!==0,I=j?c:u,$=j?u:c,D=d?0:32,L=d?24:48,T=Math.max(p-D,200)/I,z=Math.max(x-L,200)/$,A=d||C?T:Math.min(T,z);return Math.min(Math.max(A,J/100),Q/100)},[r,d,C,c,u,l]);t.useEffect(()=>{if(!h||g!=="fit")return;const m=requestAnimationFrame(()=>b(w()));return()=>cancelAnimationFrame(m)},[w,h,g,s.width,s.height,u,c,l]);const N=t.useCallback(m=>{const p=Math.max(J,Math.min(Q,m));y("manual"),b(p/100)},[]),_=t.useCallback(()=>{y("manual"),b(m=>Math.min(Q,(Math.floor(Math.round(m*100)/Y)+1)*Y)/100)},[]),P=t.useCallback(()=>{y("manual"),b(m=>Math.max(J,(Math.ceil(Math.round(m*100)/Y)-1)*Y)/100)},[]),k=t.useCallback(()=>{y("fit"),b(w()),window.requestAnimationFrame(()=>{r.current?.scrollTo({top:0,left:0,behavior:"smooth"})})},[w,r]);return{scale:v,zoomMode:g,zoomPercentage:`${Math.round(v*100)}%`,zoomIn:_,zoomOut:P,setManualZoom:N,fitToScreen:k}}function Ye(r,s,u){return Math.min(Math.max(r,s),u)}function Je(r){const[s,u]=t.useState(!1);t.useEffect(()=>{const l=()=>{u(!!document.fullscreenElement&&document.fullscreenElement===r.current)};return document.addEventListener("fullscreenchange",l),()=>{document.removeEventListener("fullscreenchange",l)}},[r]);const c=t.useCallback(async()=>{try{document.fullscreenElement?await document.exitFullscreen():await r.current?.requestFullscreen()}catch(l){console.warn("Não foi possível alternar o fullscreen.",l)}},[r]);return{isFullscreen:s,toggleFullscreen:c}}function Qe(r=!0){t.useEffect(()=>{if(!r)return;const s=document.documentElement,u=document.body.style.overflow,c=s.style.overscrollBehavior;return document.body.style.overflow="hidden",s.style.overscrollBehavior="none",()=>{document.body.style.overflow=u,s.style.overscrollBehavior=c}},[r])}function Me({idleMs:r=3200,suspended:s=!1}={}){const[u,c]=t.useState(!0),l=t.useRef(null),h=t.useCallback(()=>{l.current!==null&&(window.clearTimeout(l.current),l.current=null)},[]),d=t.useCallback(()=>{h(),!s&&(l.current=window.setTimeout(()=>{c(!1)},r))},[h,r,s]),C=t.useCallback(()=>{c(!0),d()},[d]),v=t.useCallback(()=>{c(b=>{const g=!b;return g?d():h(),g})},[d,h]);return t.useEffect(()=>{if(s){c(!0),h();return}return d(),h},[s,d,h]),{visible:u,wake:C,toggle:v}}async function ot(r,s){const u=s.replace(/[\\/:*?"<>|]+/g," ").trim()||"livro",c=(l,h)=>{const d=document.createElement("a");d.href=l,d.download=u,h&&(d.target="_blank",d.rel="noopener noreferrer"),document.body.appendChild(d),d.click(),d.remove()};try{const l=await fetch(r,{mode:"cors",credentials:"omit"});if(!l.ok)throw new Error(`HTTP ${l.status}`);const h=URL.createObjectURL(await l.blob());c(h,!1),window.setTimeout(()=>URL.revokeObjectURL(h),6e4)}catch{c(r,!0)}}function et(){const[r,s]=t.useState(!1);return t.useEffect(()=>{const u=requestAnimationFrame(()=>s(!0));return()=>cancelAnimationFrame(u)},[]),r?"opacity-100 scale-100":"opacity-0 scale-[0.98]"}const lt=595,ct=842;function tt(){const r=()=>({width:typeof window<"u"?window.innerWidth:1280,height:typeof window<"u"?window.innerHeight:800}),[s,u]=t.useState(r);return t.useEffect(()=>{const c=()=>u(r());return window.addEventListener("resize",c),window.addEventListener("orientationchange",c),()=>{window.removeEventListener("resize",c),window.removeEventListener("orientationchange",c)}},[]),{...s,isMobile:s.width<640,isTablet:s.width>=640&&s.width<1024,isDesktop:s.width>=1024}}const nt=`
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`,it=`
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`,X=nt,Ne=`
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
`;function ut({ref:r,title:s,author:u,formatLabel:c,coverUrl:l,onClose:h,loading:d,loadingTitle:C,loadingSubtitle:v,error:b,errorTitle:g,errorPrimary:y,pageNumber:w,numPages:N,canPrev:_,canNext:P,onPrev:k,onNext:m,pageWidth:p,pageHeight:x,onDownload:j,headerExtras:I,panel:$,panelTitle:D,panelOpen:L=!1,onClosePanel:T,onTogglePanel:z,children:A}){const a=t.useRef(null),i=t.useRef(null),ee=t.useRef(null),Te=t.useRef(null),de=tt(),{isMobile:he}=de,[B,Ce]=t.useState(0),[S,me]=t.useState(!1),te=!d&&!b,Le=Ve({containerRef:i,viewport:de,pageWidth:p,pageHeight:x,rotation:B,enabled:te}),{scale:E,zoomMode:fe,zoomIn:O,zoomOut:H,setManualZoom:be,fitToScreen:Z}=Le,{isFullscreen:ne,toggleFullscreen:re}=Je(a),ae=t.useRef({x:.5,y:.5});t.useEffect(()=>{const n=i.current;if(!n)return;const o=()=>{const{scrollLeft:f,scrollTop:F,scrollWidth:U,scrollHeight:W,clientWidth:V,clientHeight:Pe}=n;ae.current={x:U?(f+V/2)/U:.5,y:W?(F+Pe/2)/W:.5}};return n.addEventListener("scroll",o,{passive:!0}),()=>n.removeEventListener("scroll",o)},[]),t.useLayoutEffect(()=>{const n=i.current;n&&(n.scrollLeft=ae.current.x*n.scrollWidth-n.clientWidth/2,n.scrollTop=ae.current.y*n.scrollHeight-n.clientHeight/2)},[E]),Qe();const{visible:pe,wake:xe}=Me({suspended:d||!!b||S||L}),{visible:Re,wake:ve}=Me({idleMs:2500,suspended:d||!!b}),M=t.useCallback(()=>{xe(),ve()},[xe,ve]),_e=et(),se=t.useCallback(()=>{Ce(n=>(n+90)%360)},[]);t.useEffect(()=>{const n=o=>{const f=o.target;if(!(f?.tagName==="INPUT"||f?.tagName==="TEXTAREA"||f?.isContentEditable)&&!(o.ctrlKey||o.metaKey||o.altKey))switch(M(),o.key){case"Escape":S?me(!1):L?T?.():document.fullscreenElement?document.exitFullscreen().catch(()=>{}):h();break;case"ArrowRight":case"PageDown":case" ":o.preventDefault(),m();break;case"ArrowLeft":case"PageUp":o.preventDefault(),k();break;case"+":case"=":o.preventDefault(),O();break;case"-":case"_":o.preventDefault(),H();break;case"0":o.preventDefault(),Z();break;case"r":case"R":o.preventDefault(),se();break;case"f":case"F":o.preventDefault(),re();break;case"t":case"T":z&&(o.preventDefault(),z());break}};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[Z,h,T,m,k,z,L,se,S,re,M,O,H]);const G=t.useCallback(n=>{n<0?O():H()},[O,H]);t.useEffect(()=>{const n=i.current;if(!n)return;const o=f=>{f.ctrlKey&&(f.preventDefault(),G(f.deltaY))};return n.addEventListener("wheel",o,{passive:!1}),()=>n.removeEventListener("wheel",o)},[G]),t.useEffect(()=>{if(!S)return;const n=o=>{ee.current?.contains(o.target)||me(!1)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}},[S]),t.useEffect(()=>{S&&Te.current?.scrollIntoView({block:"center"})},[S]);const R=t.useRef(null),K=t.useRef(0),oe=t.useRef(E),we=t.useRef(B);t.useEffect(()=>{oe.current=E,we.current=B},[E,B]);const le=t.useCallback((n,o)=>{if(M(),Math.hypot(n,o)<10){const f=Date.now();f-K.current<300?(K.current=0,fe==="manual"?Z():be(E*1.5)):K.current=f;return}K.current=0,Math.abs(n)>60&&Math.abs(o)<100&&E<=1.3&&(n<0?m():k())},[Z,m,k,E,be,M,fe]),ze=n=>{if(M(),n.touches.length!==1){R.current=null;return}R.current={x:n.touches[0].clientX,y:n.touches[0].clientY}},Se=n=>{const o=R.current;if(R.current=null,!o)return;const f=n.changedTouches[0];le(f.clientX-o.x,f.clientY-o.y)};t.useImperativeHandle(r,()=>({wake:M,localTouchStart:(n,o)=>{R.current={x:n,y:o}},localTouchEnd:(n,o)=>{const f=R.current;if(R.current=null,!f)return;const F=we.current*Math.PI/180,U=n-f.x,W=o-f.y,V=oe.current;le((U*Math.cos(F)-W*Math.sin(F))*V,(U*Math.sin(F)+W*Math.cos(F))*V)},localTouchCancel:()=>{R.current=null},isPanMode:()=>oe.current>1.3,wheelZoom:G}),[le,M,G]);const ge=`${w??"—"} / ${N??"—"}`,ye=w&&N&&N>1?Ye((w-1)/(N-1)*100,0,100):0;return e.jsxs("div",{ref:a,role:"dialog","aria-modal":"true","aria-label":`Leitor de ${s}`,className:`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${_e}
      `,onMouseMove:M,onClick:n=>{n.target===n.currentTarget&&M()},children:[e.jsxs("header",{"aria-hidden":!Re,className:`
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
          ${pe?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 -translate-y-3 pointer-events-none"}
        `,children:[e.jsx("button",{type:"button",onClick:h,className:`${X} w-10 h-10 hover:text-red-400 hover:bg-red-400/10`,"aria-label":"Fechar leitor",title:"Fechar (Esc)",children:e.jsx(ke,{className:"w-5 h-5"})}),!he&&l&&e.jsx("img",{src:l,alt:"",className:"w-8 h-11 object-cover rounded-md shadow-lg shrink-0",onError:n=>{n.target.style.display="none"}}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold truncate",children:s}),e.jsx("p",{className:"text-[11px] text-[var(--text-muted)] truncate",children:he?ge:`${u} · ${c} · ${ge}`})]}),I,e.jsxs("div",{className:`
            flex
            items-center
            gap-0.5
            p-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
            shrink-0
          `,role:"toolbar","aria-label":"Ações do leitor",children:[e.jsx("button",{type:"button",onClick:()=>{re()},className:`${X} w-9 h-9`,title:ne?"Sair da tela cheia (F)":"Tela cheia (F)","aria-label":ne?"Sair da tela cheia":"Tela cheia",children:ne?e.jsx(We,{className:"w-4 h-4"}):e.jsx(Ze,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:se,className:`${X} w-9 h-9`,title:"Girar página / orientação (R)","aria-label":"Girar página",children:e.jsx(qe,{className:"w-4 h-4"})}),j&&e.jsx("button",{type:"button",onClick:j,className:`${X} w-9 h-9`,title:`Baixar ${c}`,"aria-label":`Baixar ${c}`,children:e.jsx(Oe,{className:"w-4 h-4"})})]})]}),e.jsx("div",{role:"progressbar","aria-label":"Progresso de leitura","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(ye),className:"relative z-30 h-[3px] shrink-0 bg-white/10",children:e.jsx("div",{className:"h-full bg-[var(--gold)] transition-[width] duration-300 ease-out",style:{width:`${ye}%`}})}),e.jsxs("main",{ref:i,className:`
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        `,onTouchStart:ze,onTouchEnd:Se,children:[e.jsx("div",{className:`
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          `}),d&&!b&&e.jsxs("div",{className:`
              absolute
              inset-0
              z-20
              flex
              flex-col
              items-center
              justify-center
              gap-4
              bg-[#18181c]
            `,children:[e.jsx("div",{className:`
                w-14 h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--gold-glow)]
              `,children:e.jsx($e,{className:"w-7 h-7 animate-spin text-[var(--gold)]"})}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:C}),e.jsx("p",{className:"mt-1 text-xs text-[var(--text-muted)]",children:v})]})]}),b&&e.jsx("div",{className:`
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              p-6
            `,children:e.jsxs("div",{className:`
                max-w-md
                w-full
                p-8
                rounded-3xl
                text-center
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              `,children:[e.jsx("div",{className:`
                  mx-auto
                  mb-5
                  w-16 h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-red-500/10
                `,children:e.jsx(De,{className:"w-8 h-8 text-red-400"})}),e.jsx("h2",{className:"text-base font-semibold",children:g}),e.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--text-muted)]",children:b}),e.jsxs("div",{className:"mt-6 flex flex-wrap justify-center gap-2",children:[y&&e.jsx("button",{type:"button",onClick:y.onClick,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    `,children:y.label}),j&&e.jsx("button",{type:"button",onClick:j,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    `,children:"Baixar"}),e.jsx("button",{type:"button",onClick:h,className:`
                    px-4 py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                    transition
                  `,children:"Fechar"})]})]})}),e.jsx("div",{className:`
            relative
            z-10
            flex
            min-h-full
            min-w-full
            w-max
            items-center
            justify-center
            px-0
            sm:px-4
            py-3
            sm:py-6
          `,style:{touchAction:E>1.25?"pan-x pan-y":"pan-y"},children:e.jsx("div",{className:"select-none",children:A({scale:E,rotation:B})})}),te&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:k,disabled:!_,className:`${Ne} left-0 justify-start pl-1 sm:pl-3`,title:"Página anterior (←)","aria-label":"Página anterior",children:e.jsx(Ae,{className:"w-7 h-7 sm:w-9 sm:h-9"})}),e.jsx("button",{type:"button",onClick:m,disabled:!P,className:`${Ne} right-0 justify-end pr-1 sm:pr-3`,title:"Próxima página (→)","aria-label":"Próxima página",children:e.jsx(Ie,{className:"w-7 h-7 sm:w-9 sm:h-9"})})]}),L&&$&&e.jsxs("aside",{className:`
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
            `,style:{top:59},children:[e.jsxs("div",{className:`
                sticky
                top-0
                z-10
                flex items-center
                justify-between
                px-4 py-3
                bg-[var(--bg-2)]
                border-b
                border-[var(--border)]
              `,children:[e.jsx("h2",{className:"text-sm font-semibold text-[var(--text)]",children:D}),e.jsx("button",{type:"button",onClick:T,className:`${X} w-8 h-8`,"aria-label":`Fechar ${D??"painel"}`,children:e.jsx(ke,{className:"w-4 h-4"})})]}),e.jsx("nav",{className:"p-2",children:$})]})]}),te&&e.jsx(Ke,{zoom:Math.round(E*100),onZoomIn:O,onZoomOut:H,onReset:Z,scrollRef:i,minZoom:J,maxZoom:Q,hidden:!pe,onActivity:M})]})}function dt({width:r,height:s,scale:u,rotation:c,children:l}){const h=c%180!==0;return e.jsx("div",{className:"relative shrink-0",style:{width:(h?s:r)*u,height:(h?r:s)*u},children:e.jsx("div",{className:"absolute",style:{left:"50%",top:"50%",width:r,height:s,transform:`translate(-50%, -50%) rotate(${c}deg) scale(${u})`,transformOrigin:"center center"},children:l})})}export{ct as P,ut as R,dt as S,lt as a,nt as b,at as c,it as d,st as g,ot as t};
