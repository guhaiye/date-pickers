<template>
    <div :class="[prefixCls]" v-clickoutside="handleClose">
        <div ref="reference" :class="[prefixCls + '-rel']">
            <slot>
                <iInput
                    :key="forceInputRerender"
                    :element-id="elementId"
                    :class="[prefixCls + '-editor']"
                    :readonly="!editable || readonly"
                    :disabled="disabled"
                    :size="size"
                    :placeholder="placeholder"
                    :value="visualValue"
                    :name="name"
                    @on-input-change="handleInputChange"
                    @on-focus="handleFocus"
                    @on-blur="handleBlur"
                    @on-click="handleIconClick"
                    @mouseenter.native="handleInputMouseenter"
                    @mouseleave.native="handleInputMouseleave"

                    :icon="iconType"
                ></iInput>
            </slot>
        </div>
        <transition name="transition-drop">
            <Drop
                @click.native="handleTransferClick"
                v-show="opened"
                :class="{ [prefixCls + '-transfer']: transfer }"
                :placement="placement"
                ref="drop"
                :data-transfer="transfer"
                v-transfer-dom>
                <div>
                    <component
                        :is="panel"
                        ref="pickerPanel"
                        :visible="visible"
                        :showTime="type === 'datetime' || type === 'datetimerange'"
                        :confirm="isConfirm"
                        :selectionMode="selectionMode"
                        :steps="steps"
                        :format="format"
                        :value="internalValue"
                        :start-date="startDate"
                        :split-panels="splitPanels"
                        :show-week-numbers="showWeekNumbers"
                        :picker-type="type"
                        :multiple="multiple"

                        :time-picker-options="timePickerOptions"

                        v-bind="ownPickerProps"

                        @on-pick="onPick"
                        @on-pick-clear="handleClear"
                        @on-pick-success="onPickSuccess"
                        @on-pick-click="disableClickOutSide = true"
                        @on-selection-mode-change="onSelectionModeChange"
                    ></component>
                </div>
            </Drop>
        </transition>
    </div>
</template>
<script>


    import iInput from 'view-design/src/components/input/input.vue';
    import Drop from './directives/dropdown.vue';
    import clickoutside from './directives/clickoutside';
    import TransferDom from './directives/transfer-dom';
    import { oneOf } from './utils/assist';
    import { DEFAULT_FORMATS, RANGE_SEPARATOR, TYPE_VALUE_RESOLVER_MAP } from './util';
    import Emitter from './mixins/emitter';

    const prefixCls = 'ivu-date-picker';

    const isEmptyArray = val => val.reduce((isEmpty, str) => isEmpty && !str || (typeof str === 'string' && str.trim() === ''), true);

    export default {
        name: 'CalendarPicker',
        mixins: [ Emitter ],
        components: { iInput, Drop },
        directives: { clickoutside, TransferDom },
        props: {
            format: {
                type: String
            },
            readonly: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            editable: {
                type: Boolean,
                default: true
            },
            clearable: {
                type: Boolean,
                default: true
            },
            confirm: {
                type: Boolean,
                default: false
            },
            open: {
                type: Boolean,
                default: null
            },
            multiple: {
                type: Boolean,
                default: false
            },
            timePickerOptions: {
                default: () => ({}),
                type: Object,
            },
            splitPanels: {
                type: Boolean,
                default: false
            },
            showWeekNumbers: {
                type: Boolean,
                default: false
            },
            startDate: {
                type: Date
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            placeholder: {
                type: String,
                default: ''
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']);
                },
                default: 'bottom-start'
            },
            transfer: {
                type: Boolean,
                default: false
            },
            name: {
                type: String
            },
            elementId: {
                type: String
            },
            steps: {
                type: Array,
                default: () => []
            },
            value: {
                type: [Date, String, Array]
            },
            options: {
                type: Object,
                default: () => ({})
            },
            separator: {
              type: String,
              default: ' - '
            },
          type: {
              type: String,
              default: ' - '
            }
        },
        data(){
            const isRange = this.type.includes('range');
            const emptyArray = isRange ? [null, null] : [null];
            const initialValue = isEmptyArray((isRange ? this.value : [this.value]) || []) ? emptyArray : this.parseDate(this.value);

            return {
                prefixCls: prefixCls,
                showClose: false,
                visible: false,
                internalValue: initialValue,
                disableClickOutSide: false,    // fixed when click a date,trigger clickoutside to close picker
                disableCloseUnderTransfer: false,  // transfer 模式下，点击Drop也会触发关闭,
                selectionMode: this.onSelectionModeChange(this.type),
                forceInputRerender: 1
            };
        },
        computed: {
            publicVModelValue(){
                if (this.multiple){
                    return this.internalValue.slice();
                } else {
                    const isRange = this.type.includes('range');
                    let val = this.internalValue.map(date => date instanceof Date ? new Date(date) : (date || ''));

                    if (this.type.match(/^time/)) val = val.map(this.formatDate);
                    return (isRange || this.multiple) ? val : val[0];
                }
            },
            publicStringValue(){
                const {formatDate, publicVModelValue, type} = this;
                if (type.match(/^time/)) return publicVModelValue;
                if (this.multiple) return formatDate(publicVModelValue);
              if (this.type === 'quarterrange'||this.type === 'quarter' ) {
                let value = publicVModelValue;
                let arr = [];
                let aend = '';
                if (Array.isArray(value) && value.length > 0 &&  value[0]) {
                  const start = value[0];
                  if ( value.length===2){
                    const end = value[1];
                    if (start && end) {
                      aend =  new Date(end.getFullYear(), (end.getMonth()+3), 0);
                    }else{
                      aend =  new Date(start.getFullYear(), (start.getMonth()+3), 0);
                    }
                  } else{
                    aend =  new Date(start.getFullYear(), (start.getMonth()+3), 0);
                  }
                  arr = [start,aend]
                  return arr.map(formatDate)
                }else if (!Array.isArray(value) && value instanceof Date){
                  const start = value;
                  aend =  new Date(start.getFullYear(), (start.getMonth()+3), 0);
                  arr = [start,aend]
                  return arr.map(formatDate)
                }

                return '';
              }
                return Array.isArray(publicVModelValue) ? publicVModelValue.map(formatDate) : formatDate(publicVModelValue);
            },
            opened () {
                return this.open === null ? this.visible : this.open;
            },
            iconType () {
                let icon = 'ios-calendar-outline';
                if (this.type === 'time' || this.type === 'timerange') icon = 'ios-clock-outline';
                if (this.showClose) icon = 'ios-close';
                return icon;
            },
            transition () {
                const bottomPlaced = this.placement.match(/^bottom/);
                return bottomPlaced ? 'slide-up' : 'slide-down';
            },
            visualValue() {
              if (this.type === 'quarterrange') {
                return this.formatDateQuerter(this.internalValue);
              }else if (this.type === 'monthrange' ) {
                return this.formatDate(this.internalValue);
              }else{
                return this.formatDate(this.internalValue);
              }
            },
            isConfirm(){
                return this.confirm || this.type === 'datetime' || this.type === 'datetimerange' || this.multiple;
            }
        },
        methods: {
            onSelectionModeChange(type){
                if (type.match(/^date/)) type = 'date';
                if (type.match(/^month/)) type = 'month';
                if (type.match(/^quarter/)) type = 'quarter';
                this.selectionMode = oneOf(type, ['year', 'month', 'date','quarter', 'time']) && type;
                return this.selectionMode;
            },
            // 开启 transfer 时，点击 Drop 即会关闭，这里不让其关闭
            handleTransferClick () {
                if (this.transfer) this.disableCloseUnderTransfer = true;
            },
            handleClose () {
                if (this.disableCloseUnderTransfer) {
                    this.disableCloseUnderTransfer = false;
                    return false;
                }
                if (this.open !== null) return;

                this.visible = false;
                this.disableClickOutSide = false;
            },
            handleFocus () {
                if (this.readonly) return;
                this.visible = true;
                this.$refs.pickerPanel.onToggleVisibility(true);
            },
            handleBlur () {
                this.visible = false;
                this.onSelectionModeChange(this.type);
                this.internalValue = this.internalValue.slice(); // trigger panel watchers to reset views
                this.reset();
                this.$refs.pickerPanel.onToggleVisibility(false);

            },
            reset(){
                this.$refs.pickerPanel.reset && this.$refs.pickerPanel.reset();
            },
            handleInputChange (event) {
                const isArrayValue = this.type.includes('range') || this.multiple;
                const oldValue = this.visualValue;
                const newValue = event.target.value;
                const newDate = this.parseDate(newValue);
                const disabledDateFn =
                    this.options &&
                    typeof this.options.disabledDate === 'function' &&
                    this.options.disabledDate;
                const valueToTest = isArrayValue ? newDate : newDate[0];
                const isDisabled = disabledDateFn && disabledDateFn(valueToTest);
                const isValidDate = newDate.reduce((valid, date) => valid && date instanceof Date, true);

                if (newValue !== oldValue && !isDisabled && isValidDate) {
                    this.emitChange();
                    this.internalValue = newDate;
                } else {
                    this.forceInputRerender++;
                }
            },
            handleInputMouseenter () {
                if (this.readonly || this.disabled) return;
                if (this.visualValue && this.clearable) {
                    this.showClose = true;
                }
            },
            handleInputMouseleave () {
                this.showClose = false;
            },
            handleIconClick () {
                if (this.showClose) {
                    this.handleClear();
                } else if (!this.disabled) {
                    this.handleFocus();
                }
            },
            handleClear () {
                this.visible = false;
                this.internalValue = this.internalValue.map(() => null);
                this.$emit('on-clear');
                this.dispatch('FormItem', 'on-form-change', '');
                this.emitChange();
                this.reset();

                setTimeout(
                    () => this.onSelectionModeChange(this.type),
                    500
                );
            },
            emitChange () {
                this.$nextTick(() => {
                    this.$emit('on-change', this.publicStringValue);
                    this.dispatch('FormItem', 'on-form-change', this.publicStringValue);
                });
            },
            parseDate(val) {
              const isRange = this.type.includes('range');
              const type = this.type;
              const parser = (
                TYPE_VALUE_RESOLVER_MAP[type] ||
                TYPE_VALUE_RESOLVER_MAP['default']
              ).parser;
              const format = this.format || DEFAULT_FORMATS[type];
              const multipleParser = TYPE_VALUE_RESOLVER_MAP['multiple'].parser;

              if (val && type === 'time' && !(val instanceof Date)) {
                val = parser(val, format, this.separator);
              } else if (this.multiple && val) {
                val = multipleParser(val, format, this.separator);
              } else if (isRange) {
                if (!val){
                  val = [null, null];
                } else {
                  if (typeof val === 'string') {
                    val = parser(val, format, this.separator);
                  } else if (type === 'timerange') {
                    val = parser(val, format, this.separator).map(v => v || '');
                  } else {
                    const [start, end] = val;
                    if (start instanceof Date && end instanceof Date){
                      val = val.map(date => new Date(date));
                    } else if (typeof start === 'string' && typeof end === 'string'){
                      val = parser(val.join(this.separator), format, this.separator);
                    } else if (!start || !end){
                      val = [null, null];
                    }
                  }
                }
              } else if (typeof val === 'string' && type.indexOf('time') !== 0){
                val = parser(val, format) || null;
              }

              return (isRange || this.multiple) ? (val || []) : [val];
            },
            formatDateQuerter(value){
              if (Array.isArray(value) && value.length > 0 &&value[0]) {
                if (value.length === 2){
                  const start = value[0];
                  const end = value[1];

                  if (start && end) {
                    let aend =  new Date(end.getFullYear(), (end.getMonth()+3), 0);
                    let txt = start.getFullYear()+'年'+ this.quarterchange(start.getMonth()+1)+'-'+aend.getFullYear()+'年'+this.quarterchange(aend.getMonth()+1);
                    return txt
                  }
                } else{
                  const start = value[0];
                  // let txt = start
                  let txt = start.getFullYear()+'年'+ this.quarterchange(start.getMonth()+1);
                  return txt
                }

              } else if (!Array.isArray(value) && value instanceof Date){
                let txt = value.getFullYear()+'年'+ this.quarterchange(value.getMonth()+1);
                return txt
              }
              return '';
            },
            quarterchange (date) {
              if (date){
                // let year = date.split('-');
                let quarter;
                if (date<=12&&date>9) {
                  quarter =  '四季度';
                }else if (date<=9&&date>6) {
                  quarter =  '三季度';
                }
                else if (date<=6&&date>3) {
                  quarter =  '二季度';
                }
                else  if (date<=3&&date>0){
                  quarter =  '一季度';
                }else{
                  quarter = '';
                }
                return quarter;
              }
            },
            formatDate(value){
              const format = DEFAULT_FORMATS[this.type];
                if (this.multiple) {
                    const formatter = TYPE_VALUE_RESOLVER_MAP.multiple.formatter;
                    return formatter(value, this.format || format,this.separator);
                } else {
                    const {formatter} = (
                        TYPE_VALUE_RESOLVER_MAP[this.type] ||
                        TYPE_VALUE_RESOLVER_MAP['default']
                    );
                    return formatter(value, this.format || format,this.separator);
                }
            },
            onPick(dates, visible = false) {
                if (this.multiple){
                    const pickedTimeStamp = dates.getTime();
                    const indexOfPickedDate = this.internalValue.findIndex(date => date && date.getTime() === pickedTimeStamp);
                    const allDates = [...this.internalValue, dates].filter(Boolean);
                    const timeStamps = allDates.map(date => date.getTime()).filter((ts, i, arr) => arr.indexOf(ts) === i && i !== indexOfPickedDate); // filter away duplicates
                    this.internalValue = timeStamps.map(ts => new Date(ts));
                } else {
                    this.internalValue = Array.isArray(dates) ? dates : [dates];
                }

                if (!this.isConfirm) this.onSelectionModeChange(this.type); // reset the selectionMode
                if (!this.isConfirm) this.visible = visible;
                this.emitChange();
            },
            onPickSuccess(){
                this.visible = false;
                this.$emit('on-ok');
                this.reset();
            },
        },
        watch: {
            visible :function(state) {
                if (state === false){
                  // console.log(this.$refs.drop);
                  this.$refs.drop.destroy();
                    const input = this.$el.querySelector('input');
                    if (input) input.blur();
                }
                this.$refs.drop.update();
                this.$emit('on-open-change', state);
            },
            value(val) {
                this.internalValue = this.parseDate(val);

            },
            open (val) {
                this.visible = val === true;
            },
            type(type){
                this.onSelectionModeChange(type);
            },
            publicVModelValue(now, before){
                const newValue = JSON.stringify(now);
                const oldValue = JSON.stringify(before);
                const shouldEmitInput = newValue !== oldValue || typeof now !== typeof before;
                if (shouldEmitInput) this.$emit('input', now); // to update v-model
            },
        },
        mounted () {
            const initialValue = this.value;
            const parsedValue = this.publicVModelValue;
            if (typeof initialValue !== typeof parsedValue || JSON.stringify(initialValue) !== JSON.stringify(parsedValue)){
                this.$emit('input', this.publicVModelValue); // to update v-model
            }
            if (this.open !== null) this.visible = this.open;
        }
    };
</script>
