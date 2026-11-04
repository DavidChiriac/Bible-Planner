import{a as ge}from"./chunk-MA5SPHFC.js";import{a as fe,b as ue}from"./chunk-Q67PUBRD.js";import{a as be,b as me}from"./chunk-KKLJ3QCG.js";import{b as ce,c as de}from"./chunk-UIHS6P4U.js";import{$ as F,Ad as oe,B as g,Ba as w,Bd as re,C as h,Ca as T,Cc as k,Da as V,Ea as Y,Ec as q,Ed as se,Fa as c,Ga as d,Gc as J,Hc as K,Ic as D,Jc as Q,K as E,La as S,Ma as x,Na as P,Nc as X,Oa as H,Od as pe,Pa as L,Q as a,Qa as G,Ra as m,U as _,V as j,X as W,Y as z,aa as C,ba as v,db as U,ea as I,fa as O,fd as ee,ga as p,ha as l,ia as o,id as te,ja as y,jd as ne,kb as Z,kd as ae,md as ie,nd as le,qa as M,sa as f,ta as b,ua as R,v as N,va as $,w as B,x as A,z as u}from"./chunk-M3MHEI6L.js";import"./chunk-UIGZEDL5.js";import"./chunk-SVOHG6Z2.js";import"./chunk-CIHM7STN.js";import"./chunk-DAQOROHW.js";var he=`
    .p-floatlabel {
        display: block;
        position: relative;
    }

    .p-floatlabel label {
        position: absolute;
        pointer-events: none;
        top: 50%;
        transform: translateY(-50%);
        transition-property: all;
        transition-timing-function: ease;
        line-height: 1;
        font-weight: dt('floatlabel.font.weight');
        inset-inline-start: dt('floatlabel.position.x');
        color: dt('floatlabel.color');
        transition-duration: dt('floatlabel.transition.duration');
    }

    .p-floatlabel:has(.p-textarea) label {
        top: dt('floatlabel.position.y');
        transform: translateY(0);
    }

    .p-floatlabel:has(.p-inputicon:first-child) label {
        inset-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-floatlabel:has(input:focus) label,
    .p-floatlabel:has(input.p-filled) label,
    .p-floatlabel:has(input:-webkit-autofill) label,
    .p-floatlabel:has(textarea:focus) label,
    .p-floatlabel:has(textarea.p-filled) label,
    .p-floatlabel:has(.p-inputwrapper-focus) label,
    .p-floatlabel:has(.p-inputwrapper-filled) label,
    .p-floatlabel:has(input[placeholder]) label,
    .p-floatlabel:has(textarea[placeholder]) label {
        top: dt('floatlabel.over.active.top');
        transform: translateY(0);
        font-size: dt('floatlabel.active.font.size');
        font-weight: dt('floatlabel.active.font.weight');
    }

    .p-floatlabel:has(input.p-filled) label,
    .p-floatlabel:has(textarea.p-filled) label,
    .p-floatlabel:has(.p-inputwrapper-filled) label {
        color: dt('floatlabel.active.color');
    }

    .p-floatlabel:has(input:focus) label,
    .p-floatlabel:has(input:-webkit-autofill) label,
    .p-floatlabel:has(textarea:focus) label,
    .p-floatlabel:has(.p-inputwrapper-focus) label {
        color: dt('floatlabel.focus.color');
    }

    .p-floatlabel-in .p-inputtext,
    .p-floatlabel-in .p-textarea,
    .p-floatlabel-in .p-select-label,
    .p-floatlabel-in .p-multiselect-label,
    .p-floatlabel-in .p-multiselect-label:has(.p-chip),
    .p-floatlabel-in .p-autocomplete-input-multiple,
    .p-floatlabel-in .p-cascadeselect-label,
    .p-floatlabel-in .p-treeselect-label {
        padding-block-start: dt('floatlabel.in.input.padding.top');
        padding-block-end: dt('floatlabel.in.input.padding.bottom');
    }

    .p-floatlabel-in:has(input:focus) label,
    .p-floatlabel-in:has(input.p-filled) label,
    .p-floatlabel-in:has(input:-webkit-autofill) label,
    .p-floatlabel-in:has(textarea:focus) label,
    .p-floatlabel-in:has(textarea.p-filled) label,
    .p-floatlabel-in:has(.p-inputwrapper-focus) label,
    .p-floatlabel-in:has(.p-inputwrapper-filled) label,
    .p-floatlabel-in:has(input[placeholder]) label,
    .p-floatlabel-in:has(textarea[placeholder]) label {
        top: dt('floatlabel.in.active.top');
    }

    .p-floatlabel-on:has(input:focus) label,
    .p-floatlabel-on:has(input.p-filled) label,
    .p-floatlabel-on:has(input:-webkit-autofill) label,
    .p-floatlabel-on:has(textarea:focus) label,
    .p-floatlabel-on:has(textarea.p-filled) label,
    .p-floatlabel-on:has(.p-inputwrapper-focus) label,
    .p-floatlabel-on:has(.p-inputwrapper-filled) label,
    .p-floatlabel-on:has(input[placeholder]) label,
    .p-floatlabel-on:has(textarea[placeholder]) label {
        top: 0;
        transform: translateY(-50%);
        border-radius: dt('floatlabel.on.border.radius');
        background: dt('floatlabel.on.active.background');
        padding: dt('floatlabel.on.active.padding');
    }

    .p-floatlabel:has([class^='p-'][class$='-fluid']) {
        width: 100%;
    }

    .p-floatlabel:has(.p-invalid) label {
        color: dt('floatlabel.invalid.color');
    }
`;var Pe=["*"],ke=`
    ${he}

    /* For PrimeNG */
    .p-floatlabel:has(.ng-invalid.ng-dirty) label {
        color: dt('floatlabel.invalid.color');
    }
`,De={root:({instance:t})=>["p-floatlabel",{"p-floatlabel-over":t.variant==="over","p-floatlabel-on":t.variant==="on","p-floatlabel-in":t.variant==="in"}]},_e=(()=>{class t extends q{name="floatlabel";style=ke;classes=De;static \u0275fac=(()=>{let n;return function(r){return(n||(n=E(t)))(r||t)}})();static \u0275prov=N({token:t,factory:t.\u0275fac})}return t})();var Ce=new A("FLOATLABEL_INSTANCE"),Ee=(()=>{class t extends K{componentName="FloatLabel";_componentStyle=u(_e);$pcFloatLabel=u(Ce,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=u(D,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}variant="over";static \u0275fac=(()=>{let n;return function(r){return(n||(n=E(t)))(r||t)}})();static \u0275cmp=_({type:t,selectors:[["p-floatlabel"],["p-floatLabel"],["p-float-label"]],hostVars:2,hostBindings:function(e,r){e&2&&Y(r.cx("root"))},inputs:{variant:"variant"},features:[H([_e,{provide:Ce,useExisting:t},{provide:J,useExisting:t}]),W([D]),z],ngContentSelectors:Pe,decls:1,vars:0,template:function(e,r){e&1&&(R(),$(0))},dependencies:[Z,k,Q],encapsulation:2,changeDetection:0})}return t})(),ve=(()=>{class t{static \u0275fac=function(e){return new(e||t)};static \u0275mod=j({type:t});static \u0275inj=B({imports:[Ee,k,k]})}return t})();var Fe=t=>({mobile:t}),Ie=(t,i)=>({"gap-3":t,"mt-5 flex-column":i}),Oe=(t,i)=>({"gap-3":t,"mt-3 flex-column":i}),ye=(t,i)=>({"mt-3":t,"mt-4":i}),Me=()=>({width:"25rem"}),we=(t,i)=>i.id;function Te(t,i){t&1&&y(0,"br")}function Ve(t,i){t&1&&y(0,"br")}function Le(t,i){if(t&1){let n=M();l(0,"button",25),f("click",function(){let r=g(n).$implicit,s=b();return h(s.theme.setPalette(r.id))}),l(1,"span",26)(2,"span",27),y(3,"span",28),o()(),l(4,"span",29),c(5),o()()}if(t&2){let n=i.$implicit,e=b();T("active",e.theme.selectedPaletteId()===n.id),F("aria-label",n.label)("aria-pressed",e.theme.selectedPaletteId()===n.id),a(),w("background",n.bg),a(),w("background",n.card),a(),w("background",n.accent),a(2),d(n.label)}}function Ne(t,i){if(t&1){let n=M();l(0,"button",30),f("click",function(){let r=g(n).$implicit,s=b();return h(s.setLanguage(r.id))}),l(1,"span",31),c(2),o(),l(3,"span",32),c(4),o()()}if(t&2){let n=i.$implicit,e=b();T("active",e.i18n.lang()===n.id),F("aria-label",n.label)("aria-pressed",e.i18n.lang()===n.id),a(2),d(n.id==="ro"?"\u{1F1F7}\u{1F1F4}":"\u{1F1EC}\u{1F1E7}"),a(2),d(n.label)}}function Be(t,i){if(t&1){let n=M();l(0,"div",16)(1,"p-button",33),f("onClick",function(){g(n);let r=b();return h(r.deleteCustomPlan())}),c(2),o()()}if(t&2){let n=b();a(),p("outlined",!0),a(),d(n.i18n.t("settings.deleteCustomPlan"))}}var Se=class t{utils=u(pe);theme=u(ge);i18n=u(se);firebase=u(X);setLanguage(i){this.i18n.setLang(i)}resetConfirmationVisible=!1;deletePlanVisible=!1;setStartDate(i){if(!i)return;let n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;this.firebase.setStartDate(n),this.utils.startDate.set(this.utils.startDateAsDate(n))}setMonths(i){i&&(this.firebase.setMonths(i),this.utils.months.set(i))}resetProgress(){this.resetConfirmationVisible=!0}confirmResetProgress(){this.resetConfirmationVisible=!1,this.firebase.resetProgress().then(()=>{this.utils.readSet.set(new Set)}).catch(i=>alert("Error resetting progress: "+i.message))}deleteCustomPlan(){this.deletePlanVisible=!0}confirmDeleteCustomPlan(){this.deletePlanVisible=!1,this.firebase.deleteCustomPlanConfig().then(()=>{this.utils.customPlanConfig.set(null),this.utils.selectedPlan()==="Personalizat"&&(this.utils.selectedPlan.set("Cronologic"),this.firebase.setSelectedPlan("Cronologic"))}).catch(i=>alert("Error deleting custom plan: "+i.message))}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=_({type:t,selectors:[["app-settings"]],decls:42,vars:49,consts:[[3,"ngClass"],[1,"w-100","mt-5","flex","flex-column","align-items-center","gap-3","justify-content-center",3,"ngClass"],[1,"flex","align-items-center",3,"ngClass"],["for","start-date"],["dateFormat","dd/mm/yy","placeholder","dd/mm/yyyy","pInputMask","99/99/9999",3,"ngModelChange","ngModel"],["for","number-of-months"],["id","number-of-months","type","number","min","1","pInputText","","autocomplete","off",3,"ngModelChange","ngModel"],[1,"palette-section",3,"ngClass"],[1,"palette-label"],[1,"palette-grid"],[1,"palette-swatch",3,"active"],[1,"language-section",3,"ngClass"],[1,"lang-grid"],[1,"lang-btn",3,"active"],[1,"mt-6"],[1,"reset-progress",3,"onClick"],[1,"mt-3"],[3,"visibleChange","header","modal","visible"],[1,"p-text-secondary","block","mb-2"],[1,"p-text-secondary","block","mb-8","font-italic"],[1,"flex","justify-content-center","gap-2"],[1,"confirm-reset-progress",3,"onClick","label"],[1,"cancel-reset-progress",3,"onClick","label"],[1,"p-text-secondary","block","mb-8"],["severity","danger",1,"confirm-reset-progress",3,"onClick","label"],[1,"palette-swatch",3,"click"],[1,"swatch-bg"],[1,"swatch-card"],[1,"swatch-accent"],[1,"swatch-name"],[1,"lang-btn",3,"click"],[1,"lang-flag"],[1,"lang-name"],["severity","danger",1,"delete-plan",3,"onClick","outlined"]],template:function(n,e){n&1&&(l(0,"div",0)(1,"div",1)(2,"div",2)(3,"label",3),c(4),o(),C(5,Te,1,0,"br"),l(6,"p-datepicker",4),P("ngModelChange",function(s){return x(e.utils.startDate,s)||(e.utils.startDate=s),s}),f("ngModelChange",function(s){return e.setStartDate(s)}),o()(),l(7,"div",2)(8,"label",5),c(9),o(),C(10,Ve,1,0,"br"),l(11,"input",6),f("ngModelChange",function(s){return e.setMonths(s)}),o()(),l(12,"div",7)(13,"label",8),c(14),o(),l(15,"div",9),I(16,Le,6,11,"button",10,we),o()(),l(18,"div",11)(19,"label",8),c(20),o(),l(21,"div",12),I(22,Ne,5,6,"button",13,we),o()(),l(24,"div",14)(25,"p-button",15),f("onClick",function(){return e.resetProgress()}),c(26),o()(),C(27,Be,3,2,"div",16),o()(),l(28,"p-dialog",17),P("visibleChange",function(s){return x(e.resetConfirmationVisible,s)||(e.resetConfirmationVisible=s),s}),l(29,"span",18),c(30),o(),l(31,"span",19),c(32),o(),l(33,"div",20)(34,"p-button",21),f("onClick",function(){return e.confirmResetProgress()}),o(),l(35,"p-button",22),f("onClick",function(){return e.resetConfirmationVisible=!1}),o()()(),l(36,"p-dialog",17),P("visibleChange",function(s){return x(e.deletePlanVisible,s)||(e.deletePlanVisible=s),s}),l(37,"span",23),c(38),o(),l(39,"div",20)(40,"p-button",24),f("onClick",function(){return e.confirmDeleteCustomPlan()}),o(),l(41,"p-button",22),f("onClick",function(){return e.deletePlanVisible=!1}),o()()()),n&2&&(p("ngClass",e.utils.isMobile()?"container-mobile":"container"),a(),p("ngClass",G(33,Fe,e.utils.isMobile())),a(),p("ngClass",m(35,Ie,!e.utils.isMobile(),e.utils.isMobile())),a(2),d(e.i18n.t("settings.startDate")),a(),v(e.utils.isMobile()?5:-1),a(),S("ngModel",e.utils.startDate),a(),p("ngClass",m(38,Oe,!e.utils.isMobile(),e.utils.isMobile())),a(2),d(e.i18n.t("settings.months")),a(),v(e.utils.isMobile()?10:-1),a(),p("ngModel",e.utils.months()),a(),p("ngClass",m(41,ye,!e.utils.isMobile(),e.utils.isMobile())),a(2),d(e.i18n.t("settings.colorTheme")),a(2),O(e.theme.palettes),a(2),p("ngClass",m(44,ye,!e.utils.isMobile(),e.utils.isMobile())),a(2),d(e.i18n.t("settings.language")),a(2),O(e.i18n.languages),a(4),d(e.i18n.t("settings.resetProgress")),a(),v(e.utils.customPlanConfig()?27:-1),a(),V(L(47,Me)),p("header",e.i18n.t("settings.resetDialogHeader"))("modal",!0),S("visible",e.resetConfirmationVisible),a(2),d(e.i18n.t("settings.resetDialogConfirm")),a(2),d(e.i18n.t("settings.resetDialogNote")),a(2),p("label",e.i18n.t("common.confirm")),a(),p("label",e.i18n.t("common.cancel")),a(),V(L(48,Me)),p("header",e.i18n.t("settings.deletePlanDialogHeader"))("modal",!0),S("visible",e.deletePlanVisible),a(2),d(e.i18n.t("settings.deletePlanDialogConfirm")),a(2),p("label",e.i18n.t("common.confirm")),a(),p("label",e.i18n.t("common.cancel")))},dependencies:[re,oe,de,ce,ve,le,ee,ae,te,ie,ne,ue,fe,me,be,U],styles:[".mobile[_ngcontent-%COMP%]{font-size:24px;padding-inline:1rem}.palette-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.75rem}.palette-label[_ngcontent-%COMP%]{font-weight:600;color:var(--deep-umber);font-size:1rem}.palette-grid[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}.palette-swatch[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.4rem;background:none;border:2px solid transparent;border-radius:12px;padding:.5rem;cursor:pointer;transition:border-color .2s ease,transform .15s ease}.palette-swatch[_ngcontent-%COMP%]:hover{transform:scale(1.06)}.palette-swatch.active[_ngcontent-%COMP%]{border-color:var(--terracotta)}.palette-swatch[_ngcontent-%COMP%]   .swatch-bg[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:10px;box-shadow:var(--shadow-soft)}.palette-swatch[_ngcontent-%COMP%]   .swatch-card[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:6px}.palette-swatch[_ngcontent-%COMP%]   .swatch-accent[_ngcontent-%COMP%]{width:16px;height:16px;border-radius:50%}.palette-swatch[_ngcontent-%COMP%]   .swatch-name[_ngcontent-%COMP%]{font-size:.75rem;font-weight:600;color:var(--deep-umber)}.language-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.75rem}.lang-grid[_ngcontent-%COMP%]{display:flex;gap:.75rem}.lang-btn[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.35rem;background:var(--card-bg);border:2px solid transparent;border-radius:12px;padding:.6rem 1.1rem;cursor:pointer;box-shadow:var(--shadow-soft);transition:border-color .2s ease,transform .15s ease,box-shadow .2s ease}.lang-btn[_ngcontent-%COMP%]:hover{transform:scale(1.05);box-shadow:0 4px 12px #0000001f}.lang-btn.active[_ngcontent-%COMP%]{border-color:var(--terracotta)}.lang-btn[_ngcontent-%COMP%]   .lang-flag[_ngcontent-%COMP%]{font-size:1.75rem;line-height:1;color:var(--brown)}.lang-btn[_ngcontent-%COMP%]   .lang-name[_ngcontent-%COMP%]{font-size:.75rem;font-weight:600;color:var(--brown);white-space:nowrap}.delete-plan[_ngcontent-%COMP%]     .p-button{background:transparent;border:1.5px solid var(--terracotta);color:var(--terracotta);border-radius:12px;font-weight:600;padding:.6rem 1.25rem;transition:all .2s ease}.delete-plan[_ngcontent-%COMP%]     .p-button:hover{background:var(--terracotta);color:#fff}.delete-plan[_ngcontent-%COMP%]     .p-button:active{transform:scale(.96)}"]})};export{Se as Settings};
