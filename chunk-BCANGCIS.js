import{a as ue}from"./chunk-ORZPBLJN.js";import{b as he,d as fe}from"./chunk-4PTYYRRB.js";import{c as S}from"./chunk-FTYUHUGY.js";import{a as pe,c as ge}from"./chunk-OLVBLXBF.js";import{$ as _,Ba as te,Ca as ie,D as x,Ea as ae,G as j,Ha as s,I as z,L as f,R as p,Ua as P,W as v,Wa as re,X as Z,Xc as se,Z as I,_ as b,bd as k,ca as g,cb as c,da as J,ea as X,eb as M,ed as le,fb as U,gd as O,hd as B,id as d,ja as r,jd as A,ka as Y,la as ee,ma as N,ob as ce,pa as ne,qa as L,qb as de,ra as R,rc as C,sc as G,tb as F,tc as T,u as y,v as q,va as $,w as W,wa as u,x as E,xa as w,ya as H,z as a,za as oe}from"./chunk-B3XIWB6Y.js";import{a as D}from"./chunk-DAQOROHW.js";var De=["data-p-icon","chevron-up"],me=(()=>{class n extends pe{static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275cmp=v({type:n,selectors:[["","data-p-icon","chevron-up"]],features:[b],attrs:De,decls:1,vars:0,consts:[["d","M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z","fill","currentColor"]],template:function(t,o){t&1&&(x(),ne(0,"path",0))},encapsulation:2})}return n})();var ve=`
    .p-accordionpanel {
        display: flex;
        flex-direction: column;
        border-style: solid;
        border-width: dt('accordion.panel.border.width');
        border-color: dt('accordion.panel.border.color');
    }

    .p-accordionheader {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: dt('accordion.header.padding');
        color: dt('accordion.header.color');
        background: dt('accordion.header.background');
        border-style: solid;
        border-width: dt('accordion.header.border.width');
        border-color: dt('accordion.header.border.color');
        font-weight: dt('accordion.header.font.weight');
        border-radius: dt('accordion.header.border.radius');
        transition:
            background dt('accordion.transition.duration'),
            color dt('accordion.transition.duration'),
            outline-color dt('accordion.transition.duration'),
            box-shadow dt('accordion.transition.duration');
        outline-color: transparent;
    }

    .p-accordionpanel:first-child > .p-accordionheader {
        border-width: dt('accordion.header.first.border.width');
        border-start-start-radius: dt('accordion.header.first.top.border.radius');
        border-start-end-radius: dt('accordion.header.first.top.border.radius');
    }

    .p-accordionpanel:last-child > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.bottom.border.radius');
    }

    .p-accordionpanel:last-child.p-accordionpanel-active > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.active.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.active.bottom.border.radius');
    }

    .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.color');
    }

    .p-accordionpanel:not(.p-disabled) .p-accordionheader:focus-visible {
        box-shadow: dt('accordion.header.focus.ring.shadow');
        outline: dt('accordion.header.focus.ring.width') dt('accordion.header.focus.ring.style') dt('accordion.header.focus.ring.color');
        outline-offset: dt('accordion.header.focus.ring.offset');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) > .p-accordionheader:hover {
        background: dt('accordion.header.hover.background');
        color: dt('accordion.header.hover.color');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader {
        background: dt('accordion.header.active.background');
        color: dt('accordion.header.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover {
        background: dt('accordion.header.active.hover.background');
        color: dt('accordion.header.active.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.hover.color');
    }

    .p-accordioncontent {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-accordioncontent-wrapper {
        min-height: 0;
    }

    .p-accordioncontent-content {
        border-style: solid;
        border-width: dt('accordion.content.border.width');
        border-color: dt('accordion.content.border.color');
        background-color: dt('accordion.content.background');
        color: dt('accordion.content.color');
        padding: dt('accordion.content.padding');
    }
`;var K=["*"],Ee=["toggleicon"],xe=n=>({active:n});function Ie(n,l){}function Ne(n,l){n&1&&_(0,Ie,0,0,"ng-template")}function we(n,l){if(n&1&&_(0,Ne,1,0,null,0),n&2){let e=u();r("ngTemplateOutlet",e.toggleicon)("ngTemplateOutletContext",re(2,xe,e.active()))}}function He(n,l){if(n&1&&N(0,"span",4),n&2){let e=u(3);s(e.cn(e.cx("toggleicon"),e.pcAccordion.collapseIcon)),r("pBind",e.ptm("toggleicon")),g("aria-hidden",!0)}}function Pe(n,l){if(n&1&&(x(),N(0,"svg",5)),n&2){let e=u(3);s(e.cx("toggleicon")),r("pBind",e.ptm("toggleicon")),g("aria-hidden",!0)}}function Me(n,l){if(n&1&&(L(0),_(1,He,1,4,"span",2)(2,Pe,1,4,"svg",3),R()),n&2){let e=u(2);p(),r("ngIf",e.pcAccordion.collapseIcon),p(),r("ngIf",!e.pcAccordion.collapseIcon)}}function Fe(n,l){if(n&1&&N(0,"span",4),n&2){let e=u(3);s(e.cn(e.cx("toggleicon"),e.pcAccordion.expandIcon)),r("pBind",e.ptm("toggleicon")),g("aria-hidden",!0)}}function Te(n,l){if(n&1&&(x(),N(0,"svg",7)),n&2){let e=u(3);r("pBind",e.ptm("toggleicon")),g("aria-hidden",!0)}}function Oe(n,l){if(n&1&&(L(0),_(1,Fe,1,4,"span",2)(2,Te,1,2,"svg",6),R()),n&2){let e=u(2);p(),r("ngIf",e.pcAccordion.expandIcon),p(),r("ngIf",!e.pcAccordion.expandIcon)}}function Be(n,l){if(n&1&&_(0,Me,3,2,"ng-container",1)(1,Oe,3,2,"ng-container",1),n&2){let e=u();r("ngIf",e.active()),p(),r("ngIf",!e.active())}}var ke=`
${ve}

/* For PrimeNG */
.p-accordionheader-toggle-icon.icon-start {
    order: -1;
}

.p-accordionheader:has(.p-accordionheader-toggle-icon.icon-start) {
    justify-content: flex-start;
    gap: dt('accordion.header.padding');
}

.p-accordionheader.p-ripple {
    overflow: hidden;
    position: relative;
}

.p-accordioncontent .p-motion {
    display: grid;
    grid-template-rows: 1fr;
}
`,Se={root:"p-accordion p-component",panel:({instance:n})=>["p-accordionpanel",{"p-accordionpanel-active":n.active(),"p-disabled":n.disabled()}],header:"p-accordionheader",toggleicon:"p-accordionheader-toggle-icon",contentContainer:"p-accordioncontent",contentWrapper:"p-accordioncontent-wrapper",content:"p-accordioncontent-content"},m=(()=>{class n extends le{name="accordion";style=ke;classes=Se;static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275prov=q({token:n,factory:n.\u0275fac})}return n})();var be=new E("ACCORDION_PANEL_INSTANCE"),Ae=new E("ACCORDION_HEADER_INSTANCE"),ye=new E("ACCORDION_CONTENT_INSTANCE"),_e=new E("ACCORDION_INSTANCE"),Q=(()=>{class n extends B{$pcAccordionPanel=a(be,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});componentName="AccordionPanel";onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=a(y(()=>V));value=U(void 0);disabled=M(!1,{transform:e=>S(e)});active=c(()=>this.pcAccordion.multiple()?this.valueEquals(this.pcAccordion.value(),this.value()):this.pcAccordion.value()===this.value());valueEquals(e,t){return Array.isArray(e)?e.includes(t):e===t}_componentStyle=a(m);static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275cmp=v({type:n,selectors:[["p-accordion-panel"],["p-accordionpanel"]],hostVars:4,hostBindings:function(t,o){t&2&&(g("data-p-disabled",o.disabled())("data-p-active",o.active()),s(o.cx("panel")))},inputs:{value:[1,"value"],disabled:[1,"disabled"]},outputs:{value:"valueChange"},features:[P([m,{provide:be,useExisting:n},{provide:O,useExisting:n}]),I([d]),b],ngContentSelectors:K,decls:1,vars:0,template:function(t,o){t&1&&(w(),H(0))},dependencies:[F,A],encapsulation:2,changeDetection:0})}return n})(),Ke=(()=>{class n extends B{$pcAccordionHeader=a(Ae,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});componentName="AccordionHeader";onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=a(y(()=>V));pcAccordionPanel=a(y(()=>Q));id=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);active=c(()=>this.pcAccordionPanel.active());disabled=c(()=>this.pcAccordionPanel.disabled());ariaControls=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);toggleicon;onClick(e){if(this.disabled())return;let t=this.active();this.changeActiveValue();let o=this.active(),i=this.pcAccordionPanel.value();!t&&o?this.pcAccordion.onOpen.emit({originalEvent:e,index:i}):t&&!o&&this.pcAccordion.onClose.emit({originalEvent:e,index:i})}onFocus(){!this.disabled()&&this.pcAccordion.selectOnFocus()&&this.changeActiveValue()}onKeydown(e){switch(e.code){case"ArrowDown":this.arrowDownKey(e);break;case"ArrowUp":this.arrowUpKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Enter":case"Space":case"NumpadEnter":this.onEnterKey(e);break;default:break}}_componentStyle=a(m);changeActiveValue(){this.pcAccordion.updateValue(this.pcAccordionPanel.value())}findPanel(e){return e?.closest('[data-pc-name="accordionpanel"]')}findHeader(e){return C(e,'[data-pc-name="accordionheader"]')}findNextPanel(e,t=!1){let o=t?e:e.nextElementSibling;return o?T(o,"data-p-disabled")?this.findNextPanel(o):this.findHeader(o):null}findPrevPanel(e,t=!1){let o=t?e:e.previousElementSibling;return o?T(o,"data-p-disabled")?this.findPrevPanel(o):this.findHeader(o):null}findFirstPanel(){return this.findNextPanel(this.pcAccordion.el.nativeElement.firstElementChild,!0)}findLastPanel(){return this.findPrevPanel(this.pcAccordion.el.nativeElement.lastElementChild,!0)}changeFocusedPanel(e,t){G(t)}arrowDownKey(e){let t=this.findNextPanel(this.findPanel(e.currentTarget));t?this.changeFocusedPanel(e,t):this.onHomeKey(e),e.preventDefault()}arrowUpKey(e){let t=this.findPrevPanel(this.findPanel(e.currentTarget));t?this.changeFocusedPanel(e,t):this.onEndKey(e),e.preventDefault()}onHomeKey(e){let t=this.findFirstPanel();this.changeFocusedPanel(e,t),e.preventDefault()}onEndKey(e){let t=this.findLastPanel();this.changeFocusedPanel(e,t),e.preventDefault()}onEnterKey(e){this.disabled()||this.changeActiveValue(),e.preventDefault()}get dataP(){return this.cn({active:this.active()})}static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275cmp=v({type:n,selectors:[["p-accordion-header"],["p-accordionheader"]],contentQueries:function(t,o,i){if(t&1&&oe(i,Ee,5),t&2){let h;te(h=ie())&&(o.toggleicon=h.first)}},hostVars:13,hostBindings:function(t,o){t&1&&$("click",function(h){return o.onClick(h)})("focus",function(){return o.onFocus()})("keydown",function(h){return o.onKeydown(h)}),t&2&&(g("id",o.id())("aria-expanded",o.active())("aria-controls",o.ariaControls())("aria-disabled",o.disabled())("role","button")("tabindex",o.disabled()?"-1":"0")("data-p-active",o.active())("data-p-disabled",o.disabled())("data-p",o.dataP),s(o.cx("header")),ae("user-select","none"))},features:[P([m,{provide:Ae,useExisting:n},{provide:O,useExisting:n}]),I([ge,d]),b],ngContentSelectors:K,decls:3,vars:1,consts:[[4,"ngTemplateOutlet","ngTemplateOutletContext"],[4,"ngIf"],[3,"class","pBind",4,"ngIf"],["data-p-icon","chevron-up",3,"class","pBind",4,"ngIf"],[3,"pBind"],["data-p-icon","chevron-up",3,"pBind"],["data-p-icon","chevron-down",3,"pBind",4,"ngIf"],["data-p-icon","chevron-down",3,"pBind"]],template:function(t,o){t&1&&(w(),H(0),J(1,we,1,4)(2,Be,2,2)),t&2&&(p(),X(o.toggleicon?1:2))},dependencies:[F,ce,de,ue,me,A,d],encapsulation:2,changeDetection:0})}return n})(),Ve=(()=>{class n extends B{$pcAccordionContent=a(ye,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});componentName="AccordionContent";onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}pcAccordion=a(y(()=>V));pcAccordionPanel=a(y(()=>Q));active=c(()=>this.pcAccordionPanel.active());ariaLabelledby=c(()=>`${this.pcAccordion.id()}_accordionheader_${this.pcAccordionPanel.value()}`);id=c(()=>`${this.pcAccordion.id()}_accordioncontent_${this.pcAccordionPanel.value()}`);_componentStyle=a(m);ptParams=c(()=>({context:this.active()}));computedMotionOptions=c(()=>D(D({},this.ptm("motion",this.ptParams())),this.pcAccordion.computedMotionOptions()));static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275cmp=v({type:n,selectors:[["p-accordion-content"],["p-accordioncontent"]],hostVars:6,hostBindings:function(t,o){t&2&&(g("id",o.id())("role","region")("data-p-active",o.active())("aria-labelledby",o.ariaLabelledby()),s(o.cx("contentContainer")))},features:[P([m,{provide:ye,useExisting:n},{provide:O,useExisting:n}]),I([d]),b],ngContentSelectors:K,decls:4,vars:10,consts:[["name","p-collapsible","hideStrategy","visibility",3,"visible","mountOnEnter","unmountOnLeave","options"],[3,"pBind"]],template:function(t,o){t&1&&(w(),Y(0,"p-motion",0)(1,"div",1)(2,"div",1),H(3),ee()()()),t&2&&(r("visible",o.active())("mountOnEnter",!1)("unmountOnLeave",!1)("options",o.computedMotionOptions()),p(),s(o.cx("contentWrapper")),r("pBind",o.ptm("contentWrapper",o.ptParams())),p(),s(o.cx("content")),r("pBind",o.ptm("content",o.ptParams())))},dependencies:[F,A,d,fe,he],encapsulation:2,changeDetection:0})}return n})(),V=(()=>{class n extends B{componentName="Accordion";$pcAccordion=a(_e,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=a(d,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptm("root"))}value=U(void 0);multiple=M(!1,{transform:e=>S(e)});styleClass;expandIcon;collapseIcon;selectOnFocus=M(!1,{transform:e=>S(e)});transitionOptions="400ms cubic-bezier(0.86, 0, 0.07, 1)";motionOptions=M(void 0);computedMotionOptions=c(()=>D(D({},this.ptm("motion")),this.motionOptions()));onClose=new j;onOpen=new j;id=z(se("pn_id_"));_componentStyle=a(m);onKeydown(e){switch(e.code){case"ArrowDown":this.onTabArrowDownKey(e);break;case"ArrowUp":this.onTabArrowUpKey(e);break;case"Home":e.shiftKey||this.onTabHomeKey(e);break;case"End":e.shiftKey||this.onTabEndKey(e);break}}onTabArrowDownKey(e){let t=this.findNextHeaderAction(e.target.parentElement);t?this.changeFocusedTab(t):this.onTabHomeKey(e),e.preventDefault()}onTabArrowUpKey(e){let t=this.findPrevHeaderAction(e.target.parentElement);t?this.changeFocusedTab(t):this.onTabEndKey(e),e.preventDefault()}onTabHomeKey(e){let t=this.findFirstHeaderAction();this.changeFocusedTab(t),e.preventDefault()}changeFocusedTab(e){e&&G(e)}findNextHeaderAction(e,t=!1){let o=t?e:e.nextElementSibling,i=C(o,'[data-pc-section="accordionheader"]');return i?T(i,"data-p-disabled")?this.findNextHeaderAction(i.parentElement):C(i.parentElement,'[data-pc-section="accordionheader"]'):null}findPrevHeaderAction(e,t=!1){let o=t?e:e.previousElementSibling,i=C(o,'[data-pc-section="accordionheader"]');return i?T(i,"data-p-disabled")?this.findPrevHeaderAction(i.parentElement):C(i.parentElement,'[data-pc-section="accordionheader"]'):null}findFirstHeaderAction(){let e=this.el.nativeElement.firstElementChild;return this.findNextHeaderAction(e,!0)}findLastHeaderAction(){let e=this.el.nativeElement.lastElementChild;return this.findPrevHeaderAction(e,!0)}onTabEndKey(e){let t=this.findLastHeaderAction();this.changeFocusedTab(t),e.preventDefault()}getBlockableElement(){return this.el.nativeElement.children[0]}updateValue(e){let t=this.value();if(this.multiple()){let o=Array.isArray(t)?[...t]:[],i=o.indexOf(e);i!==-1?o.splice(i,1):o.push(e),this.value.set(o)}else t===e?this.value.set(void 0):this.value.set(e)}static \u0275fac=(()=>{let e;return function(o){return(e||(e=f(n)))(o||n)}})();static \u0275cmp=v({type:n,selectors:[["p-accordion"]],hostVars:2,hostBindings:function(t,o){t&1&&$("keydown",function(h){return o.onKeydown(h)}),t&2&&s(o.cn(o.cx("root"),o.styleClass))},inputs:{value:[1,"value"],multiple:[1,"multiple"],styleClass:"styleClass",expandIcon:"expandIcon",collapseIcon:"collapseIcon",selectOnFocus:[1,"selectOnFocus"],transitionOptions:"transitionOptions",motionOptions:[1,"motionOptions"]},outputs:{value:"valueChange",onClose:"onClose",onOpen:"onOpen"},features:[P([m,{provide:_e,useExisting:n},{provide:O,useExisting:n}]),I([d]),b],ngContentSelectors:K,decls:1,vars:0,template:function(t,o){t&1&&(w(),H(0))},dependencies:[F,k,A],encapsulation:2,changeDetection:0})}return n})(),fn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=Z({type:n});static \u0275inj=W({imports:[V,k,Q,Ke,Ve,A,k,A]})}return n})();export{me as a,Q as b,Ke as c,Ve as d,V as e,fn as f};
