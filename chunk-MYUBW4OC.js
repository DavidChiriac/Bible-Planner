import{a as re,d as de}from"./chunk-BGIAVONG.js";import{a as T}from"./chunk-447XZ5Z7.js";import{$ as v,Aa as j,Ba as w,Ca as V,D as u,G as _,Ga as R,Ha as m,I as f,L as r,Nc as Y,Pc as ee,Qc as ne,R as h,Ua as G,W as k,X as P,Y as I,Ya as K,Z as H,_ as d,ad as te,bd as D,ca as b,cb as g,eb as p,ed as oe,gd as ie,hb as s,hd as ce,ib as X,id as C,ja as a,jd as ae,ka as N,la as E,ma as M,mb as U,ob as Z,pa as B,qa as S,qb as J,ra as z,tb as W,u as $,v as A,va as q,w as L,wa as x,x as O,z as y,za as Q}from"./chunk-BG5LLF3I.js";var se=(()=>{class n extends ce{modelValue=f(void 0);$filled=g(()=>Y(this.modelValue()));writeModelValue(e){this.modelValue.set(e)}static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275dir=I({type:n,features:[d]})}return n})();var le=(()=>{class n extends se{required=p(void 0,{transform:s});invalid=p(void 0,{transform:s});disabled=p(void 0,{transform:s});name=p();_disabled=f(!1);$disabled=g(()=>this.disabled()||this._disabled());onModelChange=()=>{};onModelTouched=()=>{};writeDisabledState(e){this._disabled.set(e)}writeControlValue(e,o){}writeValue(e){this.writeControlValue(e,this.writeModelValue.bind(this))}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.writeDisabledState(e),this.cd.markForCheck()}static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275dir=I({type:n,inputs:{required:[1,"required"],invalid:[1,"invalid"],disabled:[1,"disabled"],name:[1,"name"]},features:[d]})}return n})();var ke=["data-p-icon","check"],he=(()=>{class n extends T{static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275cmp=k({type:n,selectors:[["","data-p-icon","check"]],features:[d],attrs:ke,decls:1,vars:0,consts:[["d","M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z","fill","currentColor"]],template:function(o,t){o&1&&(u(),B(0,"path",0))},encapsulation:2})}return n})();var xe=["data-p-icon","minus"],pe=(()=>{class n extends T{static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275cmp=k({type:n,selectors:[["","data-p-icon","minus"]],features:[d],attrs:xe,decls:1,vars:0,consts:[["d","M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z","fill","currentColor"]],template:function(o,t){o&1&&(u(),B(0,"path",0))},encapsulation:2})}return n})();var ue=`
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`;var ge=["icon"],ve=["input"],Ce=(n,l,e)=>({checked:n,class:l,dataP:e});function ye(n,l){if(n&1&&M(0,"span",8),n&2){let e=x(3);m(e.cx("icon")),a("ngClass",e.checkboxIcon)("pBind",e.ptm("icon")),b("data-p",e.dataP)}}function _e(n,l){if(n&1&&(u(),M(0,"svg",9)),n&2){let e=x(3);m(e.cx("icon")),a("pBind",e.ptm("icon")),b("data-p",e.dataP)}}function Ie(n,l){if(n&1&&(S(0),v(1,ye,1,5,"span",6)(2,_e,1,4,"svg",7),z()),n&2){let e=x(2);h(),a("ngIf",e.checkboxIcon),h(),a("ngIf",!e.checkboxIcon)}}function Me(n,l){if(n&1&&(u(),M(0,"svg",10)),n&2){let e=x(2);m(e.cx("icon")),a("pBind",e.ptm("icon")),b("data-p",e.dataP)}}function Be(n,l){if(n&1&&(S(0),v(1,Ie,3,2,"ng-container",3)(2,Me,1,4,"svg",5),z()),n&2){let e=x();h(),a("ngIf",e.checked),h(),a("ngIf",e._indeterminate())}}function we(n,l){}function Ve(n,l){n&1&&v(0,we,0,0,"ng-template")}var De=`
    ${ue}

    /* For PrimeNG */
    p-checkBox.ng-invalid.ng-dirty .p-checkbox-box,
    p-check-box.ng-invalid.ng-dirty .p-checkbox-box,
    p-checkbox.ng-invalid.ng-dirty .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }
`,Te={root:({instance:n})=>["p-checkbox p-component",{"p-checkbox-checked p-highlight":n.checked,"p-disabled":n.$disabled(),"p-invalid":n.invalid(),"p-variant-filled":n.$variant()==="filled","p-checkbox-sm p-inputfield-sm":n.size()==="small","p-checkbox-lg p-inputfield-lg":n.size()==="large"}],box:"p-checkbox-box",input:"p-checkbox-input",icon:"p-checkbox-icon"},be=(()=>{class n extends oe{name="checkbox";style=De;classes=Te;static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275prov=A({token:n,factory:n.\u0275fac})}return n})();var me=new O("CHECKBOX_INSTANCE"),Fe={provide:re,useExisting:$(()=>fe),multi:!0},fe=(()=>{class n extends le{componentName="Checkbox";hostName="";value;binary;ariaLabelledBy;ariaLabel;tabindex;inputId;inputStyle;styleClass;inputClass;indeterminate=!1;formControl;checkboxIcon;readonly;autofocus;trueValue=!0;falseValue=!1;variant=p();size=p();onChange=new _;onFocus=new _;onBlur=new _;inputViewChild;get checked(){return this._indeterminate()?!1:this.binary?this.modelValue()===this.trueValue:ne(this.value,this.modelValue())}_indeterminate=f(void 0);checkboxIconTemplate;templates;_checkboxIconTemplate;focused=!1;_componentStyle=y(be);bindDirectiveInstance=y(C,{self:!0});$pcCheckbox=y(me,{optional:!0,skipSelf:!0})??void 0;$variant=g(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());onAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"icon":this._checkboxIconTemplate=e.template;break;case"checkboxicon":this._checkboxIconTemplate=e.template;break}})}onChanges(e){e.indeterminate&&this._indeterminate.set(e.indeterminate.currentValue)}onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}updateModel(e){let o,t=this.injector.get(de,null,{optional:!0,self:!0}),i=t&&!this.formControl?t.value:this.modelValue();this.binary?(o=this._indeterminate()?this.trueValue:this.checked?this.falseValue:this.trueValue,this.writeModelValue(o),this.onModelChange(o)):(this.checked||this._indeterminate()?o=i.filter(c=>!ee(c,this.value)):o=i?[...i,this.value]:[this.value],this.onModelChange(o),this.writeModelValue(o),this.formControl&&this.formControl.setValue(o)),this._indeterminate()&&this._indeterminate.set(!1),this.onChange.emit({checked:o,originalEvent:e})}handleChange(e){this.readonly||this.updateModel(e)}onInputFocus(e){this.focused=!0,this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.onBlur.emit(e),this.onModelTouched()}focus(){this.inputViewChild?.nativeElement.focus()}writeControlValue(e,o){o(e),this.cd.markForCheck()}get dataP(){return this.cn({invalid:this.invalid(),checked:this.checked,disabled:this.$disabled(),filled:this.$variant()==="filled",[this.size()]:this.size()})}static \u0275fac=(()=>{let e;return function(t){return(e||(e=r(n)))(t||n)}})();static \u0275cmp=k({type:n,selectors:[["p-checkbox"],["p-checkBox"],["p-check-box"]],contentQueries:function(o,t,i){if(o&1&&Q(i,ge,4)(i,te,4),o&2){let c;w(c=V())&&(t.checkboxIconTemplate=c.first),w(c=V())&&(t.templates=c)}},viewQuery:function(o,t){if(o&1&&j(ve,5),o&2){let i;w(i=V())&&(t.inputViewChild=i.first)}},hostVars:6,hostBindings:function(o,t){o&2&&(b("data-p-highlight",t.checked)("data-p-checked",t.checked)("data-p-disabled",t.$disabled())("data-p",t.dataP),m(t.cn(t.cx("root"),t.styleClass)))},inputs:{hostName:"hostName",value:"value",binary:[2,"binary","binary",s],ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",tabindex:[2,"tabindex","tabindex",X],inputId:"inputId",inputStyle:"inputStyle",styleClass:"styleClass",inputClass:"inputClass",indeterminate:[2,"indeterminate","indeterminate",s],formControl:"formControl",checkboxIcon:"checkboxIcon",readonly:[2,"readonly","readonly",s],autofocus:[2,"autofocus","autofocus",s],trueValue:"trueValue",falseValue:"falseValue",variant:[1,"variant"],size:[1,"size"]},outputs:{onChange:"onChange",onFocus:"onFocus",onBlur:"onBlur"},features:[G([Fe,be,{provide:me,useExisting:n},{provide:ie,useExisting:n}]),H([C]),d],decls:5,vars:26,consts:[["input",""],["type","checkbox",3,"focus","blur","change","checked","pBind"],[3,"pBind"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["data-p-icon","minus",3,"class","pBind",4,"ngIf"],[3,"class","ngClass","pBind",4,"ngIf"],["data-p-icon","check",3,"class","pBind",4,"ngIf"],[3,"ngClass","pBind"],["data-p-icon","check",3,"pBind"],["data-p-icon","minus",3,"pBind"]],template:function(o,t){o&1&&(N(0,"input",1,0),q("focus",function(c){return t.onInputFocus(c)})("blur",function(c){return t.onInputBlur(c)})("change",function(c){return t.handleChange(c)}),E(),N(2,"div",2),v(3,Be,3,2,"ng-container",3)(4,Ve,1,0,null,4),E()),o&2&&(R(t.inputStyle),m(t.cn(t.cx("input"),t.inputClass)),a("checked",t.checked)("pBind",t.ptm("input")),b("id",t.inputId)("value",t.value)("name",t.name())("tabindex",t.tabindex)("required",t.required()?"":void 0)("readonly",t.readonly?"":void 0)("disabled",t.$disabled()?"":void 0)("aria-labelledby",t.ariaLabelledBy)("aria-label",t.ariaLabel),h(2),m(t.cx("box")),a("pBind",t.ptm("box")),b("data-p",t.dataP),h(),a("ngIf",!t.checkboxIconTemplate&&!t._checkboxIconTemplate),h(),a("ngTemplateOutlet",t.checkboxIconTemplate||t._checkboxIconTemplate)("ngTemplateOutletContext",K(22,Ce,t.checked,t.cx("icon"),t.dataP)))},dependencies:[W,U,Z,J,D,he,pe,ae,C],encapsulation:2,changeDetection:0})}return n})(),kn=(()=>{class n{static \u0275fac=function(o){return new(o||n)};static \u0275mod=P({type:n});static \u0275inj=L({imports:[fe,D,D]})}return n})();export{he as a,se as b,le as c,fe as d,kn as e};
