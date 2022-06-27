<template>
    <div :class="classes">
        <span
            :class="getCellCls(cell)"
            v-for="(cell,i) in cells"
            :key="String(cell.date) + i"
            @click="handleClick(cell , $event)"
            @mouseenter="handleMouseMove(cell)"
        >
            <em>{{ cell.text }}</em>
        </span>
    </div>
</template>
<script>
    import { clearHours } from '../util';
    import { deepCopy } from '../utils/assist';
    import Locale from '../mixins/locale';
    import mixin from './mixin';
    import prefixCls from './prefixCls';

    export default {
        mixins: [ Locale, mixin ],
        props: {/* in mixin */},
      data(){
        return{
          add:[
            {
              title:'第一季度',
              id:'1'
            },
            {
              title:'第二季度',
              id:'2'
            },
            {
              title:'第三季度',
              id:'3'
            },
            {
              title:'第四季度',
              id:'4'
            },

          ],
        }
      },
        computed: {
            classes() {
                return [
                    `${prefixCls}`,
                    `${prefixCls}-quarter`
                ];
            },
            cells () {
              let cells = [];
              const cell_tmpl = {
                  text: '',
                  selected: false,
                  disabled: false
              };

              const tableYear = this.tableDate.getFullYear();
              const selectedDays = this.dates.filter(Boolean).map(date => clearHours(new Date(date.getFullYear(), date.getMonth(), 1)));
              // const focusedDate = clearHours(new Date(this.focusedDate.getFullYear(), this.focusedDate.getMonth(), 1));
              for (let i = 0; i < this.add.length; i++) {
                const cell = deepCopy(cell_tmpl);
                cell.date = new Date(tableYear, i*3, 1);
                cell.text =`第${i+1}季度`;
                const day = clearHours(cell.date);
                // cell.disabled = typeof this.disabledDate === 'function' && this.disabledDate(cell.date) && this.selectionMode === 'quarter';
                cell.disabled = typeof this.disabledDate === 'function' && this.disabledDate(cell.date) ;
                cell.selected = selectedDays.includes(day);
                // cell.focused = day === focusedDate;
                cells.push(cell);
              }
              return cells;
            }
        },
        methods: {
            getCellCls (cell) {
                // return [
                //     `${prefixCls}-cell`,
                //     {
                //         [`${prefixCls}-cell-selected`]: cell.selected,
                //         [`${prefixCls}-cell-disabled`]: cell.disabled,
                //         [`${prefixCls}-cell-focused`]: cell.focused,
                //         [`${prefixCls}-cell-range`]: cell.range && !cell.start && !cell.end
                //     }
                // ];
              return [
                `${prefixCls}-cell`,
                {
                  [`${prefixCls}-cell-selected`]: cell.selected || cell.start || cell.end,
                  [`${prefixCls}-cell-disabled`]: cell.disabled,
                  [`${prefixCls}-cell-today`]: cell.type === 'today',
                  [`${prefixCls}-cell-prev-month`]: cell.type === 'prevMonth',
                  [`${prefixCls}-cell-next-month`]: cell.type === 'nextMonth',
                  [`${prefixCls}-cell-week-label`]: cell.type === 'weekLabel',
                  [`${prefixCls}-cell-range`]: cell.range && !cell.start && !cell.end,
                  [`${prefixCls}-focused`]: clearHours(cell.date) === clearHours(this.focusedDate)

                }
              ];
            },
            tCell (nr) {
                return this.t(`i.datepicker.months.m${nr}`);
            }
        }
    };
</script>
<style>
  .ivu-date-picker-cells-quarter span{
    width: 75%!important;
    height: 28px;
    line-height: 28px;
    margin: 10px 12px;
    border-radius: 3px;
  }
  .ivu-date-picker-cells-quarter span em{
    width: 100%!important;
    display: inline-block;
    height: 24px;
    line-height: 24px;
    margin: 2px;
    font-style: normal;
    border-radius: 3px;
    text-align: center;
    -webkit-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
  }
</style>
