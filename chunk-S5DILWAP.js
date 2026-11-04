import{$ as b,Ba as y,Ca as h,Ea as u,Ha as o,Ia as S,L as g,La as M,R as a,Ua as A,W as T,Wa as D,Z as x,_ as B,ad as j,bd as O,ca as s,ed as Q,gd as z,hb as E,hd as q,ib as N,id as l,ja as r,ka as f,la as v,ma as w,ob as F,qb as R,sa as I,tb as V,v as C,wa as c,x as k,z as d,za as P}from"./chunk-BG5LLF3I.js";var G=`
    .p-progressbar {
        display: block;
        position: relative;
        overflow: hidden;
        height: dt('progressbar.height');
        background: dt('progressbar.background');
        border-radius: dt('progressbar.border.radius');
    }

    .p-progressbar-value {
        margin: 0;
        background: dt('progressbar.value.background');
    }

    .p-progressbar-label {
        color: dt('progressbar.label.color');
        font-size: dt('progressbar.label.font.size');
        font-weight: dt('progressbar.label.font.weight');
    }

    .p-progressbar-determinate .p-progressbar-value {
        height: 100%;
        width: 0%;
        position: absolute;
        display: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: width 1s ease-in-out;
    }

    .p-progressbar-determinate .p-progressbar-label {
        display: inline-flex;
    }

    .p-progressbar-indeterminate .p-progressbar-value::before {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }

    .p-progressbar-indeterminate .p-progressbar-value::after {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        animation-delay: 1.15s;
    }

    @keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }

    @keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
`;var J=["content"],K=n=>({$implicit:n});function L(n,m){if(n&1&&(f(0,"div"),S(1),v()),n&2){let e=c(2);u("display",e.value!=null&&e.value!==0?"flex":"none"),a(),M("",e.value,"",e.unit)}}function U(n,m){n&1&&I(0)}function W(n,m){if(n&1&&(f(0,"div",2)(1,"div",2),b(2,L,2,4,"div",3)(3,U,1,0,"ng-container",4),v()()),n&2){let e=c();o(e.cn(e.cx("value"),e.valueStyleClass)),u("width",e.value+"%")("display","flex")("background",e.color),r("pBind",e.ptm("value")),s("data-p",e.dataP),a(),o(e.cx("label")),r("pBind",e.ptm("label")),s("data-p",e.dataP),a(),r("ngIf",e.showValue&&!e.contentTemplate&&!e._contentTemplate),a(),r("ngTemplateOutlet",e.contentTemplate||e._contentTemplate)("ngTemplateOutletContext",D(17,K,e.value))}}function X(n,m){if(n&1&&w(0,"div",2),n&2){let e=c();o(e.cn(e.cx("value"),e.valueStyleClass)),u("background",e.color),r("pBind",e.ptm("value")),s("data-p",e.dataP)}}var Y={root:({instance:n})=>["p-progressbar p-component",{"p-progressbar-determinate":n.mode=="determinate","p-progressbar-indeterminate":n.mode=="indeterminate"}],value:"p-progressbar-value",label:"p-progressbar-label"},H=(()=>{class n extends Q{name="progressbar";style=G;classes=Y;static \u0275fac=(()=>{let e;return function(t){return(e||(e=g(n)))(t||n)}})();static \u0275prov=C({token:n,factory:n.\u0275fac})}return n})();var $=new k("PROGRESSBAR_INSTANCE"),_e=(()=>{class n extends q{componentName="ProgressBar";$pcProgressBar=d($,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=d(l,{self:!0});value;showValue=!0;styleClass;valueStyleClass;unit="%";mode="determinate";color;contentTemplate;onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}_componentStyle=d(H);templates;_contentTemplate;onAfterContentInit(){this.templates?.forEach(e=>{e.getType()==="content"?this._contentTemplate=e.template:this._contentTemplate=e.template})}get dataP(){return this.cn({determinate:this.mode==="determinate",indeterminate:this.mode==="indeterminate"})}static \u0275fac=(()=>{let e;return function(t){return(e||(e=g(n)))(t||n)}})();static \u0275cmp=T({type:n,selectors:[["p-progressBar"],["p-progressbar"],["p-progress-bar"]],contentQueries:function(i,t,_){if(i&1&&P(_,J,4)(_,j,4),i&2){let p;y(p=h())&&(t.contentTemplate=p.first),y(p=h())&&(t.templates=p)}},hostAttrs:["role","progressbar"],hostVars:7,hostBindings:function(i,t){i&2&&(s("aria-valuemin",0)("aria-valuenow",t.value)("aria-valuemax",100)("aria-level",t.value+t.unit)("data-p",t.dataP),o(t.cn(t.cx("root"),t.styleClass)))},inputs:{value:[2,"value","value",N],showValue:[2,"showValue","showValue",E],styleClass:"styleClass",valueStyleClass:"valueStyleClass",unit:"unit",mode:"mode",color:"color"},features:[A([H,{provide:$,useExisting:n},{provide:z,useExisting:n}]),x([l]),B],decls:2,vars:2,consts:[[3,"class","pBind","width","display","background",4,"ngIf"],[3,"class","pBind","background",4,"ngIf"],[3,"pBind"],[3,"display",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(i,t){i&1&&b(0,W,4,19,"div",0)(1,X,1,6,"div",1),i&2&&(r("ngIf",t.mode==="determinate"),a(),r("ngIf",t.mode==="indeterminate"))},dependencies:[V,F,R,O,l],encapsulation:2,changeDetection:0})}return n})();export{_e as a};
