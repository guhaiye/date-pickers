import Picker from '../picker.vue';
import DatePickerPanel from '../panel/Date/date.vue';
import RangeDatePickerPanel from '../panel/Date/date-range.vue';

import { oneOf } from '../utils/assist';

export default {
    mixins: [Picker],
    props: {
        type: {
            validator (value) {
                return oneOf(value, ['year', 'month', 'date', 'quarter', 'daterange', 'datetime', 'datetimerange','monthrange','quarterrange']);
            },
            default: 'date'
        },
    },
    // components: { DatePickerPanel, },
    components: { DatePickerPanel, RangeDatePickerPanel },
    computed: {
        panel(){
            const isRange =  this.type === 'daterange' || this.type === 'datetimerange'|| this.type === 'monthrange'|| this.type === 'quarterrange';
            return isRange ? 'RangeDatePickerPanel' : 'DatePickerPanel';
        },
        ownPickerProps(){
            return this.options;
        }
    },
};
