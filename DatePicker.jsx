export const DatePicker = ({ initialDate, onDateSelect }) => {
    const { useState, useEffect, useRef } = React;
    initialDate = initialDate ? new Date(initialDate) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate || null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [inputValue, setInputValue] = useState(initialDate ? formatDate(initialDate) : '');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const datePickerRef = useRef(null);

    const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate ? initialDate.getMonth() : today.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate ? initialDate.getFullYear() : today.getFullYear());
    const [startYear, setStartYear] = useState(today.getFullYear() - 5);

    function formatDate(date){
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    function parseDate(str) {
        const [day, month, year] = str.split('/').map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month - 1, day);
            if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
                return date;
            }
        }
        return null;
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setInputValue(formatDate(date));
        setShowCalendar(false);
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowCalendar(false);
            setShowMonthPicker(false);
            setShowYearPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        const date = parseDate(value);
        if (date) {
            setSelectedDate(date);
            setCurrentMonth(date.getMonth());
            setCurrentYear(date.getFullYear());
        }
    };

    const renderCalendar = () => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        const weeks = [];
        let days = [];

        // Add days from previous month
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push(
                <td
                    key={`prev-${i}`}
                    className="prev-month"
                    onClick={() => handleDateClick(new Date(currentYear, currentMonth - 1, daysInPrevMonth - i))}
                >
                    {daysInPrevMonth - i}
                </td>
            );
        }

        // Add days from current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isWorkday = date.getDay() >= 0 && date.getDay() <= 4; // Sunday to Thursday

            if (days.length === 7) {
                weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
                days = [];
            }
            days.push(
                <td
                    key={day}
                    className={`
              ${selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear ? 'selected' : ''}
              ${isToday ? 'today' : ''}
              ${isWorkday ? 'workday' : ''}
            `}
                    onClick={() => handleDateClick(new Date(currentYear, currentMonth, day))}
                >
                    {day}
                </td>
            );
        }

        // Add days from next month
        let nextMonthDay = 1;
        while (days.length < 7) {
            days.push(
                <td
                    key={`next-${nextMonthDay}`}
                    className="next-month"
                    onClick={() => handleDateClick(new Date(currentYear, currentMonth + 1, nextMonthDay))}
                >
                    {nextMonthDay++}
                </td>
            );
        }
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);

        return (
            <table><thead><tr>
                {daysOfWeek.map((day, index) => (
                    <th key={index}>{day}</th>
                ))}
            </tr></thead><tbody>{weeks}</tbody></table>
        );
    };

    const handlePrevMonth = (event) => {
        event.preventDefault();
        if (showYearPicker) {
            setStartYear(startYear - 10);
        } else {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        }
    };

    const handleNextMonth = (event) => {
        event.preventDefault();
        if (showYearPicker) {
            setStartYear(startYear + 10);
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const handleMonthClick = (month) => {
        setCurrentMonth(month);
        setShowMonthPicker(false);
    };

    const handleYearClick = (year) => {
        setCurrentYear(year);
        setShowYearPicker(false);
        setShowMonthPicker(true);
    };

    const handleHeaderClick = () => {
        if (showMonthPicker) {
            setShowMonthPicker(false);
            setShowYearPicker(true);
        } else if (!showYearPicker) {
            setShowMonthPicker(true);
        }
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedDate(today);
        setInputValue(formatDate(today));
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setShowCalendar(false);
        if (onDateSelect) {
            onDateSelect(today);
        }
    };

    const handleClearClick = () => {
        setSelectedDate(null);
        setInputValue('');
        setShowCalendar(false);
        if (onDateSelect) {
            onDateSelect(null);
        }
    };

    const renderMonthPicker = () => (
        <div className="month-picker">
            {months.map((month, index) => (
                <div key={index} onClick={() => handleMonthClick(index)}>
                    {month}
                </div>
            ))}
        </div>
    );

    const renderYearPicker = () => {
        const years = [];
        for (let i = startYear; i < startYear + 12; i++) {
            years.push(
                <div key={i} onClick={() => handleYearClick(i)}>
                    {i}
                </div>
            );
        }
        return (
            <div className="year-picker"><div className="years">
                {years}
            </div></div>
        );
    };

    return (
        <div className="date-picker" ref={datePickerRef}><input
            type="text"
            className="date-input"
            value={inputValue}
            onFocus={() => setShowCalendar(true)}
            onChange={handleInputChange}
            placeholder="בחר תאריך"
        />
            {showCalendar && (
                <div className="calendar"><div className="calendar-header"><div onClick={handlePrevMonth} className="arrow"><i className="icofont-arrow-right"></i></div><span onClick={handleHeaderClick} className="header-clickable">
                    {showYearPicker ? `${startYear} - ${startYear + 11}` : showMonthPicker ? currentYear : `${months[currentMonth]} ${currentYear}`}
                </span><div onClick={handleNextMonth} className="arrow"><i className="icofont-arrow-left"></i></div></div>
                    {showMonthPicker ? renderMonthPicker() : showYearPicker ? renderYearPicker() : renderCalendar()}
                    <div className="calendar-footer"><div onClick={handleTodayClick} className="footer-button">היום</div><div onClick={handleClearClick} className="footer-button">נקה</div></div></div>
            )}
        </div>
    );
}
