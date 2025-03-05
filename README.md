# DatePicker Component

![DatePicker Component](./assets/datepicker-screenshot.png)

The `DatePicker` component is a React-based date picker that allows users to select a date from a calendar interface. It includes features such as month and year navigation, displaying the current date, and clearing the selected date.

### Props:
- `initialDate`: The initial selected date as a date string. If not provided, the initial date will be `null`.
- `onDateSelect`: A function that will be called when a date is selected. The function receives the selected date as a parameter.
- `presetValues`: An array of preset values for date selection. Each value represents the number of days from the current date. A value of `null` represents a "no date" option.
- `showPresetSelect`: Indicates whether to display the preset date selection component. If `true`, the component will be displayed; if `false`, it will not be displayed.

### Usage:
```jsx
<DatePicker
    initialDate="01-01-2025"
    onDateSelect={(date) => console.log('Selected date:', date)}
    presetValues={[7, 14, 30, 60, 180, 365, null]}
    showPresetSelect={true}
/>

