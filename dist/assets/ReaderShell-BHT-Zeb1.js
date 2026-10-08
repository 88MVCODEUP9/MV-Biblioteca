import{b as k,r as t,j as e,X as ye,C as le,L as $e,B as Re}from"./index-Cw5Db-bb.js";var nt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function at(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}const Le=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],ce=k("chevron-right",Le);const Se=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],Ae=k("download",Se);const De=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]],Fe=k("maximize",De);const Oe=[["path",{d:"M8 3v3a2 2 0 0 1-2 2H3",key:"hohbtr"}],["path",{d:"M21 8h-3a2 2 0 0 1-2-2V3",key:"5jw1f3"}],["path",{d:"M3 16h3a2 2 0 0 1 2 2v3",key:"198tvr"}],["path",{d:"M16 21v-3a2 2 0 0 1 2-2h3",key:"ph8mxp"}]],Ze=k("minimize",Oe);const Be=[["path",{d:"M12 13V7",key:"h0r20n"}],["path",{d:"m15 10-3 3-3-3",key:"lzhmyn"}],["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}]],Ie=k("monitor-down",Be);const He=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],Pe=k("rotate-cw",He);const Ue=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],ge=k("zoom-in",Ue);const Ve=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],je=k("zoom-out",Ve);function ke(a,s,l){return Math.min(Math.max(a,s),l)}function qe(a){const[s,l]=t.useState(!1);t.useEffect(()=>{const c=()=>{l(!!document.fullscreenElement&&document.fullscreenElement===a.current)};return document.addEventListener("fullscreenchange",c),()=>{document.removeEventListener("fullscreenchange",c)}},[a]);const o=t.useCallback(async()=>{try{document.fullscreenElement?await document.exitFullscreen():await a.current?.requestFullscreen()}catch(c){console.warn("Não foi possível alternar o fullscreen.",c)}},[a]);return{isFullscreen:s,toggleFullscreen:o}}function Ge(a=!0){t.useEffect(()=>{if(!a)return;const s=document.documentElement,l=document.body.style.overflow,o=s.style.overscrollBehavior;return document.body.style.overflow="hidden",s.style.overscrollBehavior="none",()=>{document.body.style.overflow=l,s.style.overscrollBehavior=o}},[a])}function Ke({idleMs:a=3200,suspended:s=!1}={}){const[l,o]=t.useState(!0),c=t.useRef(null),i=t.useCallback(()=>{c.current!==null&&(window.clearTimeout(c.current),c.current=null)},[]),d=t.useCallback(()=>{i(),!s&&(c.current=window.setTimeout(()=>{o(!1)},a))},[i,a,s]),f=t.useCallback(()=>{o(!0),d()},[d]),N=t.useCallback(()=>{o(h=>{const p=!h;return p?d():i(),p})},[d,i]);return t.useEffect(()=>{if(s){o(!0),i();return}return d(),i},[s,d,i]),{visible:l,wake:f,toggle:N}}async function st(a,s){const l=s.replace(/[\\/:*?"<>|]+/g," ").trim()||"livro",o=(c,i)=>{const d=document.createElement("a");d.href=c,d.download=l,i&&(d.target="_blank",d.rel="noopener noreferrer"),document.body.appendChild(d),d.click(),d.remove()};try{const c=await fetch(a,{mode:"cors",credentials:"omit"});if(!c.ok)throw new Error(`HTTP ${c.status}`);const i=URL.createObjectURL(await c.blob());o(i,!1),window.setTimeout(()=>URL.revokeObjectURL(i),6e4)}catch{o(a,!0)}}function Xe(){const[a,s]=t.useState(!1);return t.useEffect(()=>{const l=requestAnimationFrame(()=>s(!0));return()=>cancelAnimationFrame(l)},[]),a?"opacity-100 scale-100":"opacity-0 scale-[0.98]"}const X=.15,ie=4,de=1,F=Array.from({length:78},(a,s)=>Math.round((X+s*.05)*100)/100),rt=595,ot=842;function We(){const a=()=>({width:typeof window<"u"?window.innerWidth:1280,height:typeof window<"u"?window.innerHeight:800}),[s,l]=t.useState(a);return t.useEffect(()=>{const o=()=>l(a());return window.addEventListener("resize",o),window.addEventListener("orientationchange",o),()=>{window.removeEventListener("resize",o),window.removeEventListener("orientationchange",o)}},[]),{...s,isMobile:s.width<640,isTablet:s.width>=640&&s.width<1024,isDesktop:s.width>=1024}}function Ye({containerRef:a,viewport:s,pageWidth:l,pageHeight:o,rotation:c,enabled:i}){const[d,f]=t.useState(de),[N,h]=t.useState("fit"),{isMobile:p,isTablet:M}=s,C=t.useCallback(()=>{const u=a.current;if(!u)return de;const x=u.clientWidth,O=u.clientHeight;if(!x||!O)return de;const E=c%180!==0,Y=E?o:l,Z=E?l:o,B=p?0:32,z=p?24:48,T=Math.max(x-B,200)/Y,_=Math.max(O-z,200)/Z,J=p||M?T:Math.min(T,_);return ke(J,X,ie)},[a,p,M,o,l,c]);t.useEffect(()=>{if(!i||N!=="fit")return;const u=window.setTimeout(()=>{f(C())},100);return()=>window.clearTimeout(u)},[C,i,N,s.width,s.height]);const W=t.useCallback(u=>{h("manual"),f(ke(u,X,ie))},[]),S=t.useCallback(()=>{h("manual"),f(u=>F.find(x=>x>u+.001)??ie)},[]),A=t.useCallback(()=>{h("manual"),f(u=>{for(let x=F.length-1;x>=0;x-=1)if(F[x]<u-.001)return F[x];return X})},[]),v=t.useCallback(()=>{h("fit"),f(C()),window.requestAnimationFrame(()=>{a.current?.scrollTo({top:0,left:0,behavior:"smooth"})})},[C,a]);return{scale:d,zoomMode:N,zoomPercentage:`${Math.round(d*100)}%`,zoomIn:S,zoomOut:A,setManualZoom:W,fitToScreen:v}}const Je=`
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`,Qe=`
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`,b=Je,et=Qe;function lt({ref:a,title:s,author:l,formatLabel:o,coverUrl:c,onClose:i,loading:d,loadingTitle:f,loadingSubtitle:N,error:h,errorTitle:p,errorPrimary:M,pageNumber:C,numPages:W,canPrev:S,canNext:A,onPrev:v,onNext:u,pageWidth:x,pageHeight:O,onDownload:E,headerExtras:Y,panel:Z,panelTitle:B,panelOpen:z=!1,onClosePanel:T,onTogglePanel:_,children:J}){const ue=t.useRef(null),Q=t.useRef(null),me=t.useRef(null),he=t.useRef(null),xe=We(),{isMobile:I,isTablet:Ne,isDesktop:Ee}=xe,[D,Me]=t.useState(0),[w,H]=t.useState(!1),P=!d&&!h,Ce=Ye({containerRef:Q,viewport:xe,pageWidth:x,pageHeight:O,rotation:D,enabled:P}),{scale:y,zoomMode:ee,zoomPercentage:U,zoomIn:$,zoomOut:R,setManualZoom:te,fitToScreen:L}=Ce,{isFullscreen:ne,toggleFullscreen:ae}=qe(ue);Ge();const{visible:V,wake:g}=Ke({suspended:d||!!h||w||z}),ze=Xe(),se=t.useCallback(()=>{Me(n=>(n+90)%360)},[]);t.useEffect(()=>{const n=r=>{const m=r.target;if(!(m?.tagName==="INPUT"||m?.tagName==="TEXTAREA"||m?.isContentEditable)&&!(r.ctrlKey||r.metaKey||r.altKey))switch(g(),r.key){case"Escape":w?H(!1):z?T?.():document.fullscreenElement?document.exitFullscreen().catch(()=>{}):i();break;case"ArrowRight":case"PageDown":case" ":r.preventDefault(),u();break;case"ArrowLeft":case"PageUp":r.preventDefault(),v();break;case"+":case"=":r.preventDefault(),$();break;case"-":case"_":r.preventDefault(),R();break;case"0":r.preventDefault(),L();break;case"r":case"R":r.preventDefault(),se();break;case"f":case"F":r.preventDefault(),ae();break;case"t":case"T":_&&(r.preventDefault(),_());break}};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[L,i,T,u,v,_,z,se,w,ae,g,$,R]);const q=t.useCallback(n=>{n<0?$():R()},[$,R]);t.useEffect(()=>{const n=Q.current;if(!n)return;const r=m=>{m.ctrlKey&&(m.preventDefault(),q(m.deltaY))};return n.addEventListener("wheel",r,{passive:!1}),()=>n.removeEventListener("wheel",r)},[q]),t.useEffect(()=>{if(!w)return;const n=r=>{me.current?.contains(r.target)||H(!1)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}},[w]),t.useEffect(()=>{w&&he.current?.scrollIntoView({block:"center"})},[w]);const j=t.useRef(null),G=t.useRef(0),re=t.useRef(y),be=t.useRef(D);t.useEffect(()=>{re.current=y,be.current=D},[y,D]);const oe=t.useCallback((n,r)=>{if(g(),Math.hypot(n,r)<10){const m=Date.now();m-G.current<300?(G.current=0,ee==="manual"?L():te(y*1.5)):G.current=m;return}G.current=0,Math.abs(n)>60&&Math.abs(r)<100&&y<=1.3&&(n<0?u():v())},[L,u,v,y,te,g,ee]),Te=n=>{if(g(),n.touches.length!==1){j.current=null;return}j.current={x:n.touches[0].clientX,y:n.touches[0].clientY}},_e=n=>{const r=j.current;if(j.current=null,!r)return;const m=n.changedTouches[0];oe(m.clientX-r.x,m.clientY-r.y)};t.useImperativeHandle(a,()=>({wake:g,localTouchStart:(n,r)=>{j.current={x:n,y:r}},localTouchEnd:(n,r)=>{const m=j.current;if(j.current=null,!m)return;const K=be.current*Math.PI/180,pe=n-m.x,ve=r-m.y,we=re.current;oe((pe*Math.cos(K)-ve*Math.sin(K))*we,(pe*Math.sin(K)+ve*Math.cos(K))*we)},localTouchCancel:()=>{j.current=null},isPanMode:()=>re.current>1.3,wheelZoom:q}),[oe,g,q]);const fe=`${C??"—"} / ${W??"—"}`;return e.jsxs("div",{ref:ue,role:"dialog","aria-modal":"true","aria-label":`Leitor de ${s}`,className:`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${ze}
      `,onMouseMove:g,onClick:n=>{n.target===n.currentTarget&&g()},children:[e.jsxs("header",{"aria-hidden":!V,className:`
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
          border-b
          border-[var(--border)]
          shadow-lg
          transition-[opacity,transform]
          duration-300 ease-out
          ${V?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 -translate-y-3 pointer-events-none"}
        `,children:[e.jsx("button",{type:"button",onClick:i,className:`${b} w-10 h-10 hover:text-red-400 hover:bg-red-400/10`,"aria-label":"Fechar leitor",title:"Fechar (Esc)",children:e.jsx(ye,{className:"w-5 h-5"})}),!I&&c&&e.jsx("img",{src:c,alt:"",className:"w-8 h-11 object-cover rounded-md shadow-lg shrink-0",onError:n=>{n.target.style.display="none"}}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold truncate",children:s}),!I&&e.jsxs("p",{className:"text-[11px] text-[var(--text-muted)] truncate",children:[l," · ",o]})]}),e.jsxs("div",{ref:me,className:"relative hidden sm:flex items-center",children:[e.jsxs("div",{className:`
              flex
              items-center
              gap-0.5
              p-1
              rounded-xl
              bg-[var(--bg-3)]
              border
              border-[var(--border)]
              shadow-sm
            `,children:[e.jsx("button",{type:"button",onClick:L,className:`
                ${b}
                w-9 h-9
                ${ee==="fit"?et:""}
              `,title:"Ajustar à tela (0)","aria-label":"Ajustar à tela",children:e.jsx(Ie,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:R,className:`${b} w-9 h-9`,title:"Diminuir zoom (-)","aria-label":"Diminuir zoom",children:e.jsx(je,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:()=>H(n=>!n),className:`
                min-w-[64px]
                h-9
                px-2
                rounded-lg
                text-xs
                font-semibold
                text-[var(--text)]
                hover:bg-[var(--gold-glow)]
                transition-colors
              `,title:"Selecionar zoom","aria-label":`Zoom atual ${U}`,"aria-expanded":w,children:U}),e.jsx("button",{type:"button",onClick:$,className:`${b} w-9 h-9`,title:"Aumentar zoom (+)","aria-label":"Aumentar zoom",children:e.jsx(ge,{className:"w-4 h-4"})})]}),w&&e.jsxs("div",{className:`
                absolute
                top-[calc(100%+8px)]
                right-0
                z-50
                w-44
                max-h-[60vh]
                overflow-y-auto
                p-2
                rounded-2xl
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              `,children:[e.jsx("p",{className:`
                  px-3 py-2
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-[var(--text-muted)]
                `,children:"Nível de zoom"}),e.jsx("div",{className:"grid grid-cols-2 gap-1",children:F.map(n=>{const r=Math.abs(y-n)<.01;return e.jsxs("button",{type:"button",ref:r?he:void 0,onClick:()=>{te(n),H(!1)},className:`
                        px-2
                        py-2
                        rounded-lg
                        text-xs
                        transition-colors
                        ${r?"bg-[var(--gold-glow)] text-[var(--gold)]":"text-[var(--text-sub)] hover:bg-[var(--bg-3)]"}
                      `,children:[Math.round(n*100),"%"]},n)})})]})]}),e.jsxs("div",{className:`
            hidden md:flex
            items-center
            gap-1
            px-1
            py-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
          `,children:[e.jsx("button",{type:"button",onClick:v,disabled:!S,className:`${b} w-9 h-9`,title:"Página anterior","aria-label":"Página anterior",children:e.jsx(le,{className:"w-5 h-5"})}),e.jsx("span",{className:`
              min-w-[80px]
              text-center
              text-xs
              font-medium
              text-[var(--text)]
            `,children:fe}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`${b} w-9 h-9`,title:"Próxima página","aria-label":"Próxima página",children:e.jsx(ce,{className:"w-5 h-5"})})]}),Y,e.jsx("button",{type:"button",onClick:se,className:`${b} w-10 h-10`,title:"Rotacionar página (R)","aria-label":"Rotacionar página",children:e.jsx(Pe,{className:"w-4 h-4"})}),!I&&E&&e.jsx("button",{type:"button",onClick:E,className:`${b} w-10 h-10`,title:`Baixar ${o}`,"aria-label":`Baixar ${o}`,children:e.jsx(Ae,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:()=>{ae()},className:`${b} w-10 h-10`,title:ne?"Sair da tela cheia (F)":"Tela cheia (F)","aria-label":ne?"Sair da tela cheia":"Tela cheia",children:ne?e.jsx(Ze,{className:"w-4 h-4"}):e.jsx(Fe,{className:"w-4 h-4"})})]}),e.jsxs("main",{ref:Q,className:`
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        `,onTouchStart:Te,onTouchEnd:_e,children:[e.jsx("div",{className:`
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          `}),d&&!h&&e.jsxs("div",{className:`
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
              `,children:e.jsx($e,{className:"w-7 h-7 animate-spin text-[var(--gold)]"})}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:f}),e.jsx("p",{className:"mt-1 text-xs text-[var(--text-muted)]",children:N})]})]}),h&&e.jsx("div",{className:`
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
                `,children:e.jsx(Re,{className:"w-8 h-8 text-red-400"})}),e.jsx("h2",{className:"text-base font-semibold",children:p}),e.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--text-muted)]",children:h}),e.jsxs("div",{className:"mt-6 flex flex-wrap justify-center gap-2",children:[M&&e.jsx("button",{type:"button",onClick:M.onClick,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    `,children:M.label}),E&&e.jsx("button",{type:"button",onClick:E,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    `,children:"Baixar"}),e.jsx("button",{type:"button",onClick:i,className:`
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
            px-0
            sm:px-4
            py-3
            sm:py-6
          `,style:{touchAction:y>1.25?"pan-x pan-y":"pan-y"},children:e.jsx("div",{className:"m-auto select-none",children:J({scale:y,rotation:D})})}),P&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:v,disabled:!S,className:`
                hidden sm:flex
                fixed
                left-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              `,title:"Página anterior","aria-label":"Página anterior",children:e.jsx(le,{className:"w-6 h-6"})}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`
                hidden sm:flex
                fixed
                right-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              `,title:"Próxima página","aria-label":"Próxima página",children:e.jsx(ce,{className:"w-6 h-6"})})]}),z&&Z&&e.jsxs("aside",{className:`
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
            `,style:{top:56},children:[e.jsxs("div",{className:`
                sticky
                top-0
                z-10
                flex items-center
                justify-between
                px-4 py-3
                bg-[var(--bg-2)]
                border-b
                border-[var(--border)]
              `,children:[e.jsx("h2",{className:"text-sm font-semibold text-[var(--text)]",children:B}),e.jsx("button",{type:"button",onClick:T,className:`${b} w-8 h-8`,"aria-label":`Fechar ${B??"painel"}`,children:e.jsx(ye,{className:"w-4 h-4"})})]}),e.jsx("nav",{className:"p-2",children:Z})]})]}),(I||Ne)&&P&&e.jsxs("footer",{"aria-hidden":!V,className:`
            relative
            z-30
            flex
            items-center
            justify-between
            gap-2
            px-3
            py-2
            min-h-[58px]
            bg-[var(--bg-2)]
            border-t
            border-[var(--border)]
            transition-[opacity,transform]
            duration-300 ease-out
            ${V?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 translate-y-3 pointer-events-none"}
          `,children:[e.jsx("button",{type:"button",onClick:v,disabled:!S,className:`
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            `,"aria-label":"Página anterior",children:e.jsx(le,{className:"w-6 h-6"})}),e.jsxs("div",{className:`
              flex
              items-center
              gap-1
              px-1
              py-1
              rounded-xl
              bg-[var(--bg-3)]
            `,children:[e.jsx("button",{type:"button",onClick:R,className:`
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              `,"aria-label":"Diminuir zoom",children:e.jsx(je,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:L,className:"min-w-[55px] text-xs font-semibold",title:"Ajustar à tela","aria-label":`Zoom atual ${U}. Toque para ajustar à tela`,children:U}),e.jsx("button",{type:"button",onClick:$,className:`
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              `,"aria-label":"Aumentar zoom",children:e.jsx(ge,{className:"w-4 h-4"})})]}),e.jsx("span",{className:`
              absolute
              left-1/2
              -translate-x-1/2
              bottom-[-1px]
              px-2
              py-0.5
              rounded-t-lg
              bg-[var(--bg-3)]
              text-[9px]
              text-[var(--text-muted)]
            `,children:fe}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            `,"aria-label":"Próxima página",children:e.jsx(ce,{className:"w-6 h-6"})})]}),Ee&&P&&e.jsxs("div",{className:`
            pointer-events-none
            fixed
            bottom-4
            left-1/2
            -translate-x-1/2
            z-20
            px-4
            py-2
            rounded-full
            bg-black/50
            backdrop-blur-md
            border
            border-white/10
            text-[10px]
            text-white/60
            opacity-0
            hover:opacity-100
            transition-opacity
          `,children:["← → páginas · + − zoom · 0 ajustar · R girar · F tela cheia",_?" · T sumário":""," · Ctrl + roda zoom"]})]})}function ct({width:a,height:s,scale:l,rotation:o,children:c}){const i=o%180!==0;return e.jsx("div",{className:"relative shrink-0",style:{width:(i?s:a)*l,height:(i?a:s)*l},children:e.jsx("div",{className:"absolute",style:{left:"50%",top:"50%",width:a,height:s,transform:`translate(-50%, -50%) rotate(${o}deg) scale(${l})`,transformOrigin:"center center"},children:c})})}export{ot as P,lt as R,ct as S,rt as a,Je as b,nt as c,Qe as d,at as g,st as t};
