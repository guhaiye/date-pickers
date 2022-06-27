import datePickerComponent from './src/components'
const VueDatePicker = {
    install:function(Vue){
        if(typeof window !== 'undefined' && window.Vue){
            Vue = window.Vue
        }
        Vue.component('DatePickers',datePickerComponent)
    }
}
export default VueDatePicker